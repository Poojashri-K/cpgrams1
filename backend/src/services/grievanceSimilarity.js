const recommendationService = require("./departmentRecommendationService")
const { CATEGORIES } = require("../data/departmentTaxonomy")

const DEFAULT_SIMILARITY_THRESHOLD = 0.4
const KNOWN_CATEGORIES = new Set(CATEGORIES)
const GENERIC_TOKENS = new Set([
  "about", "after", "again", "also", "area", "arrange", "as", "been", "being",
  "can", "could", "day", "days", "get", "give", "help", "issue", "make", "many",
  "need", "please", "problem", "request", "resident", "residents", "soon", "there",
  "today", "travel", "use", "using", "want", "week", "weeks",
])

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ")
}

function tokenize(value) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 1 && !GENERIC_TOKENS.has(token))
}

function createVector(tokens, documentFrequency, documentCount) {
  const frequencies = new Map()

  for (const token of tokens) {
    frequencies.set(token, (frequencies.get(token) || 0) + 1)
  }

  const vector = new Map()

  for (const [token, frequency] of frequencies) {
    const inverseDocumentFrequency =
      Math.log((documentCount + 1) / ((documentFrequency.get(token) || 0) + 1)) + 1
    vector.set(token, (1 + Math.log(frequency)) * inverseDocumentFrequency)
  }

  return vector
}

function cosineSimilarity(left, right) {
  let dotProduct = 0
  let leftMagnitude = 0
  let rightMagnitude = 0

  for (const value of left.values()) leftMagnitude += value * value
  for (const value of right.values()) rightMagnitude += value * value

  for (const [token, value] of left) {
    dotProduct += value * (right.get(token) || 0)
  }

  if (!leftMagnitude || !rightMagnitude) return 0
  return dotProduct / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude))
}

function inferCategory(subject, description) {
  return recommendationService.recommendDepartment(subject, description).predictedCategory
}

function findSimilarGrievances(description, grievances, threshold = DEFAULT_SIMILARITY_THRESHOLD, options = {}) {
  const subject = options.subject || ""
  const explicitCategory = options.category && KNOWN_CATEGORIES.has(options.category)
    ? options.category
    : null
  const queryCategory = inferCategory(subject, description) || explicitCategory
  const queryTokens = tokenize(`${subject} ${description}`)
  const candidateTokens = grievances.map((grievance) =>
    tokenize(`${grievance.subject || ""} ${grievance.description || ""}`),
  )
  const documentFrequency = new Map()

  for (const tokens of [queryTokens, ...candidateTokens]) {
    for (const token of new Set(tokens)) {
      documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1)
    }
  }

  const documentCount = candidateTokens.length + 1
  const queryVector = createVector(queryTokens, documentFrequency, documentCount)

  return grievances
    .map((grievance, index) => {
      const storedCategory = grievance.category && KNOWN_CATEGORIES.has(grievance.category)
        ? grievance.category
        : null
      const inferredCategory = inferCategory(grievance.subject, grievance.description)
      const candidateCategory = inferredCategory || storedCategory
      if (
        queryCategory &&
        (
          (candidateCategory && queryCategory !== candidateCategory) ||
          (storedCategory && queryCategory !== storedCategory)
        )
      ) return null

      const similarity = cosineSimilarity(
        queryVector,
        createVector(candidateTokens[index], documentFrequency, documentCount),
      )

      return { grievance, similarity }
    })
    .filter((match) => match && match.similarity >= threshold)
    .sort((left, right) => right.similarity - left.similarity)
}

module.exports = { findSimilarGrievances, normalizeText, DEFAULT_SIMILARITY_THRESHOLD }