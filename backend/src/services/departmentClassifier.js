const STOP_WORDS = new Set([
  "a", "about", "after", "all", "although", "an", "and", "any", "are", "as",
  "at", "be", "been", "before", "being", "but", "by", "can", "could", "did",
  "do", "does", "during", "for", "from", "had", "has", "have", "he", "her",
    "here", "hers", "him", "his", "how", "i", "if", "in", "into", "is", "it",
    "its", "may", "me", "might", "more", "most", "my", "of", "on",
  "or", "our", "ours", "same", "she", "should", "so", "some", "such", "than",
  "that", "the", "their", "theirs", "them", "then", "there", "these", "they",
  "this", "those", "through", "to", "too", "under", "until", "up", "us", "very",
  "was", "we", "were", "what", "when", "where", "which", "while", "who", "why",
  "will", "with", "would", "you", "your", "yours",
])

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token))
}

function splitKnownCompound(token, tokenIndex) {
  const bestSegments = new Array(token.length + 1).fill(null)
  bestSegments[0] = []

  for (let end = 1; end <= token.length; end += 1) {
    for (let start = 0; start < end; start += 1) {
      const segment = token.slice(start, end)
      if (segment.length < 3 || tokenIndex[segment] === undefined || !bestSegments[start]) continue

      const proposed = [...bestSegments[start], segment]
      if (!bestSegments[end] || proposed.length < bestSegments[end].length) {
        bestSegments[end] = proposed
      }
    }
  }

  return bestSegments[token.length]?.length > 1 ? bestSegments[token.length] : null
}

function tokenizeForVocabulary(value, vectorizer) {
  return tokenize(value).flatMap((token) => {
    if (vectorizer.tokenIndex[token] !== undefined) return [token]
    return splitKnownCompound(token, vectorizer.tokenIndex) || []
  })
}

function createVectorizer(texts) {
  const tokenized = texts.map(tokenize)
  const vocabulary = [...new Set(tokenized.flat())].sort()
  const tokenIndex = Object.fromEntries(vocabulary.map((token, index) => [token, index]))
  const documentFrequency = new Array(vocabulary.length).fill(0)

  for (const tokens of tokenized) {
    for (const token of new Set(tokens)) {
      documentFrequency[tokenIndex[token]] += 1
    }
  }

  return {
    vocabulary,
    tokenIndex,
    idf: documentFrequency.map(
      (frequency) => Math.log((texts.length + 1) / (frequency + 1)) + 1,
    ),
  }
}

function vectorize(text, vectorizer) {
  const frequencies = new Map()

  for (const token of tokenizeForVocabulary(text, vectorizer)) {
    const index = vectorizer.tokenIndex[token]
    if (index !== undefined) frequencies.set(index, (frequencies.get(index) || 0) + 1)
  }

  const vector = new Array(vectorizer.vocabulary.length).fill(0)
  let magnitude = 0

  for (const [index, frequency] of frequencies) {
    const weight = (1 + Math.log(frequency)) * vectorizer.idf[index]
    vector[index] = weight
    magnitude += weight * weight
  }

  if (magnitude) {
    const norm = Math.sqrt(magnitude)
    for (let index = 0; index < vector.length; index += 1) vector[index] /= norm
  }

  return vector
}

function vectorizeSparse(text, vectorizer) {
  const frequencies = new Map()

  for (const token of tokenizeForVocabulary(text, vectorizer)) {
    const index = vectorizer.tokenIndex[token]
    if (index !== undefined) frequencies.set(index, (frequencies.get(index) || 0) + 1)
  }

  const vector = []
  let magnitude = 0

  for (const [index, frequency] of frequencies) {
    const weight = (1 + Math.log(frequency)) * vectorizer.idf[index]
    vector.push([index, weight])
    magnitude += weight * weight
  }

  if (magnitude) {
    const norm = Math.sqrt(magnitude)
    for (const item of vector) item[1] /= norm
  }

  return vector
}

function softmax(logits) {
  const maximum = Math.max(...logits)
  const exponentials = logits.map((value) => Math.exp(value - maximum))
  const sum = exponentials.reduce((total, value) => total + value, 0)
  return exponentials.map((value) => value / sum)
}

function trainClassifier(examples, categories, options = {}) {
  const vectorizer = createVectorizer(examples.map((example) => example.text))
  const vectors = examples.map((example) => vectorizeSparse(example.text, vectorizer))
  const categoryIndex = Object.fromEntries(categories.map((category, index) => [category, index]))
  const weights = categories.map(() => new Array(vectorizer.vocabulary.length).fill(0))
  const bias = new Array(categories.length).fill(0)
  const epochs = options.epochs || 800
  const learningRate = options.learningRate || 0.3
  const regularization = options.regularization || 0.0005

  for (let epoch = 0; epoch < epochs; epoch += 1) {
    const weightGradients = categories.map(() => new Map())
    const biasGradients = new Array(categories.length).fill(0)

    for (let exampleIndex = 0; exampleIndex < examples.length; exampleIndex += 1) {
      const vector = vectors[exampleIndex]
      const expected = categoryIndex[examples[exampleIndex].category]
      const probabilities = softmax(weights.map((row, index) => {
        let score = bias[index]
        for (const [feature, value] of vector) score += row[feature] * value
        return score
      }))

      for (let category = 0; category < categories.length; category += 1) {
        const error = probabilities[category] - (category === expected ? 1 : 0)
        biasGradients[category] += error
        const gradients = weightGradients[category]
        for (const [feature, value] of vector) {
          gradients.set(feature, (gradients.get(feature) || 0) + error * value)
        }
      }
    }

    const scale = learningRate / examples.length
    for (let category = 0; category < categories.length; category += 1) {
      bias[category] -= scale * biasGradients[category]
      for (let feature = 0; feature < vectorizer.vocabulary.length; feature += 1) {
        weights[category][feature] -= scale * (
          (weightGradients[category].get(feature) || 0) + regularization * weights[category][feature]
        )
      }
    }
  }

  return { vectorizer, model: { categories, weights, bias } }
}

function predict(text, artifacts) {
  const vector = vectorize(text, artifacts.vectorizer)
  const { categories, weights, bias } = artifacts.model
  const probabilities = softmax(weights.map((row, index) => {
    let score = bias[index]
    for (let feature = 0; feature < vector.length; feature += 1) {
      score += row[feature] * vector[feature]
    }
    return score
  }))

  return categories
    .map((category, index) => ({ category, score: probabilities[index], index }))
    .sort((left, right) => right.score - left.score)
    .map(({ category, score, index }) => {
      const evidence = vector
        .map((value, feature) => ({
          token: artifacts.vectorizer.vocabulary[feature],
          contribution: value * weights[index][feature],
        }))
        .filter((item) => item.contribution > 0)
        .sort((left, right) => right.contribution - left.contribution)
        .slice(0, 3)
        .map((item) => item.token)

      return { category, score, evidence }
    })
}

module.exports = { predict, tokenize, tokenizeForVocabulary, trainClassifier }