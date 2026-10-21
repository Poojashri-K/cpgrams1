const {
  CATEGORIES,
  CATEGORY_DIRECTORY,
  CENTRAL_AUTHORITY_SCOPE,
  ADDITIONAL_CENTRAL_AUTHORITY_SCOPE,
} = require("../data/departmentTaxonomy")
const { predict, tokenizeForVocabulary } = require("./departmentClassifier")

const MINIMUM_SCORE_FLOOR = 0.4
const MINIMUM_TOP_TWO_MARGIN = 0.12
let model
let vectorizer
let modelLoadError

try {
  model = require("../models/department-classifier.json")
  vectorizer = require("../models/department-vectorizer.json")

  if (JSON.stringify(model.categories) !== JSON.stringify(CATEGORIES)) {
    throw new Error("Model categories do not match the configured grievance taxonomy")
  }
  if (
    !Array.isArray(vectorizer.vocabulary) ||
    vectorizer.vocabulary.length !== vectorizer.idf?.length ||
    model.weights?.length !== CATEGORIES.length ||
    model.weights.some((weights) => weights.length !== vectorizer.vocabulary.length) ||
    model.bias?.length !== CATEGORIES.length
  ) {
    throw new Error("Department model or vectorizer artifacts are invalid")
  }
} catch (error) {
  modelLoadError = error
}

function getMinimumScore() {
  const configured = Number(
    process.env.DEPARTMENT_RECOMMENDATION_MINIMUM_SCORE ??
    process.env.DEPARTMENT_RECOMMENDATION_CONFIDENCE_THRESHOLD,
  )
  const requestedMinimum = Number.isFinite(configured) && configured > 0 && configured <= 1
    ? configured
    : MINIMUM_SCORE_FLOOR
  return Math.max(MINIMUM_SCORE_FLOOR, model.recommendedMinimumScore || 0, requestedMinimum)
}

function getAuthorityOptions(category, text, jurisdiction) {
  const directory = CATEGORY_DIRECTORY[category]
  const options = []
  const centralScope = CENTRAL_AUTHORITY_SCOPE[category]
  const centralScopeMatched = jurisdiction.governmentType === "Central Government" &&
    Boolean(centralScope && centralScope.test(text))
  const isTamilNadu = jurisdiction.governmentType === "State Government" && jurisdiction.state === "Tamil Nadu"

  if (centralScopeMatched) {
    options.push({
      category,
      department: directory.department,
      authorityLevel: "central",
      requiresLocation: false,
      sourceEvidence: centralScope.exec(text)?.[0] || null,
    })
  }

  if (jurisdiction.governmentType === "Central Government") {
    for (const department of directory.centralDepartments || []) {
      const scope = ADDITIONAL_CENTRAL_AUTHORITY_SCOPE[category]?.[department]
      if (!scope?.test(text)) continue
      options.push({
        category,
        department,
        authorityLevel: "central",
        requiresLocation: true,
        locationPrompt: directory.locationPrompt,
        sourceEvidence: scope.exec(text)?.[0] || null,
      })
    }
  }

  if (isTamilNadu && !directory.localAuthorityOnly) {
    for (const department of directory.tamilNaduDepartments) {
      options.push({
        category,
        department,
        authorityLevel: "Tamil Nadu",
        requiresLocation: false,
        locationPrompt: "Confirm the district and administering office before filing.",
      })
    }
  }

  if (directory.localAuthorities.length) {
    options.push({
      category,
      department: "Responsible local authority",
      authorityLevel: "local",
      requiresLocation: true,
      locationPrompt: directory.locationPrompt,
      localAuthorityTypes: directory.localAuthorities,
    })
  }

  return options
}

function recommendDepartment(subject, description, jurisdiction = {}) {
  if (modelLoadError) {
    throw new Error(`Department recommendation model is unavailable: ${modelLoadError.message}`)
  }

  const text = `${subject} ${description}`
  const knownTokens = tokenizeForVocabulary(text, vectorizer)
  const predictions = predict(text, { model, vectorizer })
  const winner = predictions[0]
  const secondPlace = predictions[1]
  const minimumScore = getMinimumScore()
  const rankingMargin = winner.score - secondPlace.score
  const categoryUncertain = knownTokens.length === 0 ||
    winner.score < minimumScore ||
    rankingMargin < MINIMUM_TOP_TWO_MARGIN
  const scopePattern = CENTRAL_AUTHORITY_SCOPE[winner.category]
  const authorityEvidence = jurisdiction.governmentType === "Central Government"
    ? scopePattern?.exec(text)?.[0] || null
    : null
  const recommendations = categoryUncertain
    ? []
    : getAuthorityOptions(winner.category, text, jurisdiction)
  const experimentalDataRequiresReview = model.datasetType === "synthetic-demo-only"
  const manualReviewRequired = categoryUncertain || experimentalDataRequiresReview || recommendations.length > 0

  let explanation
  if (categoryUncertain) {
    explanation = knownTokens.length
      ? "The model did not separate a configured category strongly enough from alternatives. Please select a department manually."
      : "The text did not contain enough known complaint terms to match a configured category. Please select a department manually."
  } else {
    const evidence = winner.evidence.length
      ? `The model ranked this category highest using weighted terms: ${winner.evidence.join(", ")}.`
      : "The model ranked this category highest, but no strong text evidence was available."
    const scope = authorityEvidence
      ? ` Central authority scope matched: ${authorityEvidence}.`
      : " Central authority scope was not established; state/local options are provided where configured."
    const dataWarning = experimentalDataRequiresReview
      ? " The classifier uses a small synthetic demo corpus, so verify the category manually."
      : ""
    explanation = `${evidence}${scope}${dataWarning}`
  }

  return {
    predictedCategory: categoryUncertain ? null : winner.category,
    authorityEvidence,
    score: Math.round(winner.score * 1000) / 10,
    scoreThreshold: Math.round(minimumScore * 1000) / 10,
    rankingMargin: Math.round(rankingMargin * 1000) / 10,
    minimumRankingMargin: Math.round(MINIMUM_TOP_TWO_MARGIN * 1000) / 10,
    manualReviewRequired,
    jurisdictionMustBeVerified: true,
    jurisdictionNotice: "The configured directory may not include the responsible state or local authority. Verify jurisdiction before filing.",
    dataNotice: "The current model is trained only on a small English synthetic demo corpus; recommendations are experimental.",
    explanation,
    experimental: model.datasetType === "synthetic-demo-only",
    recommendations,
  }
}

module.exports = { recommendDepartment }