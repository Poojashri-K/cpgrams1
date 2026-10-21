const fs = require("node:fs")
const path = require("node:path")
const { CATEGORIES } = require("../data/departmentTaxonomy")
const { predict, trainClassifier } = require("../services/departmentClassifier")
const acceptanceCases = require("../../test/fixtures/department-recommendation-cases.json").cases

const DATA_DIRECTORY = path.join(__dirname, "..", "data", "prepared-department-data")
const TRAINING_FILE = path.join(DATA_DIRECTORY, "train.csv")
const HOLDOUT_FILE = path.join(DATA_DIRECTORY, "holdout.csv")
const PREPARATION_REPORT_FILE = path.join(DATA_DIRECTORY, "preparation-report.json")
const MODEL_DIRECTORY = path.join(__dirname, "..", "models")
const MINIMUM_SCORE = 0.4
const MINIMUM_TOP_TWO_MARGIN = 0.12

function parseCsv(contents, filePath) {
  const rows = []
  let row = []
  let field = ""
  let quoted = false
  const text = contents.replace(/^\uFEFF/, "")

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]

    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"'
        index += 1
      } else if (character === '"') {
        quoted = false
      } else {
        field += character
      }
    } else if (character === '"' && field.length === 0) {
      quoted = true
    } else if (character === ",") {
      row.push(field)
      field = ""
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""))
      rows.push(row)
      row = []
      field = ""
    } else {
      field += character
    }
  }

  if (quoted) throw new Error(`Unclosed quoted field in ${filePath}`)
  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ""))
    rows.push(row)
  }

  const [headers, ...values] = rows
  if (!headers || headers.join(",") !== "grievance_text,category") {
    throw new Error(`Unexpected columns in ${filePath}; expected grievance_text,category`)
  }

  return values
    .filter((valuesRow) => valuesRow.some((value) => value.trim()))
    .map((valuesRow, index) => {
      if (valuesRow.length !== headers.length) {
        throw new Error(`Invalid column count in ${filePath} at data row ${index + 1}`)
      }
      return {
        text: valuesRow[0].trim(),
        category: valuesRow[1].trim(),
      }
    })
}

function readExamples(filePath) {
  return parseCsv(fs.readFileSync(filePath, "utf8"), filePath)
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ")
}

function validateExamples(examples, filePath, expectedCounts) {
  if (!examples.length) throw new Error(`No examples found in ${filePath}`)

  const counts = Object.fromEntries(CATEGORIES.map((category) => [category, 0]))
  for (const [index, example] of examples.entries()) {
    if (!example.text || !CATEGORIES.includes(example.category)) {
      throw new Error(`Invalid training data at ${filePath}:${index + 2}`)
    }
    counts[example.category] += 1
  }

  const missing = CATEGORIES.filter((category) => counts[category] === 0)
  if (missing.length) throw new Error(`${filePath} has no examples for: ${missing.join(", ")}`)
  if (expectedCounts && JSON.stringify(counts) !== JSON.stringify(expectedCounts)) {
    throw new Error(`Category counts in ${filePath} do not match the preparation report`)
  }
  return counts
}

function calculateMetrics(examples, artifacts) {
  const confusionMatrix = Object.fromEntries(CATEGORIES.map((actual) => [
    actual,
    Object.fromEntries(CATEGORIES.map((predicted) => [predicted, 0])),
  ]))

  for (const example of examples) {
    const predicted = predict(example.text, artifacts)[0].category
    confusionMatrix[example.category][predicted] += 1
  }

  const perCategory = {}
  let correct = 0
  let macroPrecision = 0
  let macroRecall = 0
  let macroF1 = 0

  for (const category of CATEGORIES) {
    const truePositive = confusionMatrix[category][category]
    const falsePositive = CATEGORIES.reduce(
      (sum, actual) => sum + (actual === category ? 0 : confusionMatrix[actual][category]),
      0,
    )
    const falseNegative = CATEGORIES.reduce(
      (sum, predicted) => sum + (predicted === category ? 0 : confusionMatrix[category][predicted]),
      0,
    )
    const precision = truePositive + falsePositive ? truePositive / (truePositive + falsePositive) : 0
    const recall = truePositive + falseNegative ? truePositive / (truePositive + falseNegative) : 0
    const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0

    correct += truePositive
    macroPrecision += precision
    macroRecall += recall
    macroF1 += f1
    perCategory[category] = {
      support: CATEGORIES.reduce((sum, predicted) => sum + confusionMatrix[category][predicted], 0),
      precision,
      recall,
      f1,
    }
  }

  return {
    examples: examples.length,
    accuracy: correct / examples.length,
    macroPrecision: macroPrecision / CATEGORIES.length,
    macroRecall: macroRecall / CATEGORIES.length,
    macroF1: macroF1 / CATEGORIES.length,
    perCategory,
    confusionMatrix,
  }
}

function findAcceptanceFailures(artifacts) {
  return acceptanceCases.flatMap((example) => {
    const predictions = predict(`${example.subject} ${example.description}`, artifacts)
    const top = predictions[0]
    const margin = top.score - predictions[1].score
    const confident = top.score >= MINIMUM_SCORE && margin >= MINIMUM_TOP_TWO_MARGIN
    const passed = example.expectedCategory === null
      ? !confident
      : top.category === example.expectedCategory && confident

    return passed
      ? []
      : [{
          name: example.name,
          expectedCategory: example.expectedCategory,
          predictedCategory: top.category,
          score: top.score,
          margin,
        }]
  })
}

function backupArtifacts(timestamp) {
  const backupDirectory = path.join(MODEL_DIRECTORY, "backups", timestamp)
  fs.mkdirSync(backupDirectory, { recursive: true })

  for (const name of ["department-classifier.json", "department-vectorizer.json"]) {
    const sourcePath = path.join(MODEL_DIRECTORY, name)
    if (!fs.existsSync(sourcePath)) throw new Error(`Required existing artifact is missing: ${sourcePath}`)
    fs.copyFileSync(sourcePath, path.join(backupDirectory, name))
  }

  return backupDirectory
}

const report = JSON.parse(fs.readFileSync(PREPARATION_REPORT_FILE, "utf8"))
if (
  report.dataset_type !== "synthetic_examples_only_not_verified_real_world_grievances" ||
  JSON.stringify(report.target_categories) !== JSON.stringify(CATEGORIES)
) {
  throw new Error("Preparation report categories or dataset type do not match the existing taxonomy")
}

const expectedTrainingCounts = report.sources.training.category_counts
const trainingExamples = readExamples(TRAINING_FILE)
const trainingCounts = validateExamples(trainingExamples, TRAINING_FILE, expectedTrainingCounts)
const artifacts = trainClassifier(trainingExamples, CATEGORIES)

// Load holdout only after model fitting; it is evaluation-only.
const expectedHoldoutCounts = report.sources.holdout.category_counts
const holdoutExamples = readExamples(HOLDOUT_FILE)
const holdoutCounts = validateExamples(holdoutExamples, HOLDOUT_FILE, expectedHoldoutCounts)
const trainingTexts = new Set(trainingExamples.map((example) => normalizeText(example.text)))
const overlapCount = holdoutExamples.filter((example) => trainingTexts.has(normalizeText(example.text))).length
if (overlapCount > 0) {
  throw new Error(`Holdout contains ${overlapCount} normalized text overlap(s) with training data`)
}
const metrics = calculateMetrics(holdoutExamples, artifacts)
const acceptanceFailures = findAcceptanceFailures(artifacts)
if (acceptanceFailures.length) {
  console.error(JSON.stringify({
    status: "candidate_rejected",
    reason: "Candidate failed existing recommendation category/abstention acceptance cases; saved artifacts were not changed.",
    acceptanceFailures,
    holdoutMetrics: metrics,
  }, null, 2))
  throw new Error("Refusing to replace the current model with a candidate that fails acceptance cases")
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
const backupDirectory = backupArtifacts(timestamp)
const modelPath = path.join(MODEL_DIRECTORY, "department-classifier.json")
const vectorizerPath = path.join(MODEL_DIRECTORY, "department-vectorizer.json")

fs.writeFileSync(
  modelPath,
  JSON.stringify({
    ...artifacts.model,
    datasetType: "synthetic-demo-only",
    recommendedMinimumScore: MINIMUM_SCORE,
  }, null, 2),
)
fs.writeFileSync(
  vectorizerPath,
  JSON.stringify({ ...artifacts.vectorizer, datasetType: "synthetic-demo-only" }, null, 2),
)

console.log(JSON.stringify({
  datasetType: "synthetic_examples_only_not_verified_real_world_grievances",
  trainingSource: path.relative(process.cwd(), TRAINING_FILE),
  holdoutSource: path.relative(process.cwd(), HOLDOUT_FILE),
  holdoutUsedForTrainingVocabularyOrTuning: false,
  trainingRows: trainingExamples.length,
  trainingCategoryCounts: trainingCounts,
  holdoutRows: holdoutExamples.length,
  holdoutCategoryCounts: holdoutCounts,
  normalizedTrainHoldoutOverlap: overlapCount,
  metrics,
  backupDirectory: path.relative(process.cwd(), backupDirectory),
  artifacts: ["department-classifier.json", "department-vectorizer.json"],
  evaluationLimitation: "Both splits contain synthetic examples; these results do not establish real-world performance.",
}, null, 2))
