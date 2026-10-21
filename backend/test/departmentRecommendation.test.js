const assert = require("node:assert/strict")
const { after, test } = require("node:test")
const express = require("express")
const jwt = require("jsonwebtoken")
const Grievance = require("../src/models/Grievance")
const taxonomy = require("../src/data/departmentTaxonomy")
const acceptanceFixture = require("./fixtures/department-recommendation-cases.json")
const trainingDataset = require("../src/data/department-training-data.json")
const sharedTaxonomy = require("../../shared/grievance-taxonomy.json")
const grievanceController = require("../src/controllers/grievanceController")
const { findSimilarGrievances } = require("../src/services/grievanceSimilarity")
const recommendationController = require("../src/controllers/departmentRecommendationController")
const recommendationService = require("../src/services/departmentRecommendationService")
const TEST_JWT_SECRET = "recommendation-test-secret"
process.env.JWT_SECRET = TEST_JWT_SECRET

const savedMethods = {
  create: Grievance.create,
  find: Grievance.find,
  findOne: Grievance.findOne,
  recommendDepartment: recommendationService.recommendDepartment,
  consoleError: console.error,
}

after(() => {
  Grievance.create = savedMethods.create
  Grievance.find = savedMethods.find
  Grievance.findOne = savedMethods.findOne
  recommendationService.recommendDepartment = savedMethods.recommendDepartment
  console.error = savedMethods.consoleError
})

test("duplicate-check API excludes the exact road-versus-water false positive", async (context) => {
  const previousThreshold = process.env.DUPLICATE_SIMILARITY_THRESHOLD
  process.env.DUPLICATE_SIMILARITY_THRESHOLD = "0.3"

  const candidates = [
    {
      regNumber: "road-existing",
      subject: "Damaged road with potholes",
      description: "Deep potholes have damaged the road connecting our residential neighborhood to the highway. Rainwater collects in them and makes travel dangerous. Please repair the road.",
      category: "Roads & Transport",
      status: "submitted",
    },
    {
      regNumber: "water-existing",
      subject: "Irregular Drinking Water Supply",
      description: "The drinking water supply to our residential area is irregular. Water does not reach our homes reliably, and residents request that the supply be restored.",
      category: "Water Supply & Sanitation",
      status: "submitted",
    },
  ]
  Grievance.find = () => ({
    select() { return this },
    lean: async () => candidates,
  })

  const app = express()
  app.use(express.json())
  app.use("/api/grievances", require("../src/routes/grievanceRoutes"))
  const server = app.listen(0)
  context.after(async () => {
    if (previousThreshold === undefined) delete process.env.DUPLICATE_SIMILARITY_THRESHOLD
    else process.env.DUPLICATE_SIMILARITY_THRESHOLD = previousThreshold
    await new Promise((resolve) => server.close(resolve))
  })
  await new Promise((resolve) => server.once("listening", resolve))

  const token = jwt.sign({ id: "duplicate-test-citizen", role: "citizen" }, TEST_JWT_SECRET)
  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/api/grievances/check-duplicates`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        subject: "road damaged with potholes",
        description: "The road connecting our residential area to the main highway has numerous potholes. Rainwater collects in them, making travel dangerous for vehicles and pedestrians. Please arrange for road repairs as soon as possible.",
      }),
    },
  )

  assert.equal(response.status, 200)
  const body = await response.json()
  assert.ok(body.matches.some((match) => match.regNumber === "road-existing"))
  assert.ok(!body.matches.some((match) => match.regNumber === "water-existing"))
  assert.ok(body.matches.every((match) => match.similarity >= 40))
})

function responseRecorder() {
  return {
    statusCode: 200,
    status(code) {
      this.statusCode = code
      return this
    },
    json(body) {
      this.body = body
      return this
    },
  }
}

test("duplicate matching excludes unrelated categories and keeps genuine road and water duplicates", () => {
    const roadComplaint = {
      subject: "road damaged with potholes",
      description: "The road connecting our residential area to the main highway has numerous potholes. Rainwater collects in them, making travel dangerous for vehicles and pedestrians. Please arrange for road repairs as soon as possible.",
    }
    const roadCandidates = [
      {
        regNumber: "road-duplicate",
        subject: "Potholes on the highway road",
        description: "Our road from the neighborhood to the highway has deep potholes. Rainwater fills the damaged surface and creates danger for drivers and pedestrians. Repairs are urgently needed.",
        category: "Roads & Transport",
      },
      {
        regNumber: "water-false-positive",
        subject: "Irregular Drinking Water Supply",
        description: "Residents have no drinking water supply in the area. Water does not reach our homes regularly and we need the local office to arrange water supply immediately.",
        category: "Water Supply & Sanitation",
      },
    ]
    const roadMatches = findSimilarGrievances(roadComplaint.description, roadCandidates, 0.4, {
      subject: roadComplaint.subject,
    })

    assert.deepEqual(roadMatches.map(({ grievance }) => grievance.regNumber), ["road-duplicate"])
    assert.ok(roadMatches[0].similarity >= 0.4)

    const streetlightComplaint = {
      subject: "Streetlight outage",
      description: "Streetlights on our road have been dark for weeks, making pedestrians unsafe at night. Please repair the lamps.",
    }
    const unrelatedScholarship = {
      regNumber: "scholarship-false-positive",
      subject: "Scholarship payment delayed",
      description: "My student scholarship payment has not been deposited despite submitting the required documents. Please arrange payment as soon as possible.",
      category: "Education",
    }
    assert.deepEqual(
      findSimilarGrievances(streetlightComplaint.description, [unrelatedScholarship], 0.4, {
        subject: streetlightComplaint.subject,
      }),
      [],
    )

    const waterComplaint = {
      subject: "Drinking water supply stopped",
      description: "There has been no clean tap water in our neighborhood for several days. The drinking water supply has stopped and households need water restored.",
    }
    const waterDuplicate = {
      regNumber: "water-duplicate",
      subject: "No water reaching our homes",
      description: "For days, clean water has not come through the taps in our locality. Families cannot get drinking water and ask for the supply to be restored.",
      category: "Water Supply & Sanitation",
    }
    const waterMatches = findSimilarGrievances(waterComplaint.description, [waterDuplicate], 0.4, {
      subject: waterComplaint.subject,
    })

    assert.deepEqual(waterMatches.map(({ grievance }) => grievance.regNumber), ["water-duplicate"])
    assert.ok(waterMatches[0].similarity >= 0.4)
})

test("AI metadata is absent on ordinary grievance documents", () => {
  const grievance = new Grievance({
    regNumber: "CPG/2026/000001",
    user: "507f1f77bcf86cd799439011",
    subject: "Citizen-selected department",
    description: "A grievance filed without requesting an AI recommendation.",
    department: "Ministry of Power",
  })

  assert.equal(grievance.toObject().aiRecommendation, undefined)
})

test("category prediction does not imply an authority recommendation", () => {
  const cases = [
    [
      "Scholarship payment delayed",
      "I have not received my scholarship amount for three months despite submitting all required documents.",
      "Education",
      "Department of School Education & Literacy",
    ],
    [
      "Streetlight not working",
      "Street lights on our municipal road have been dark for weeks, making the area unsafe for pedestrians at night.",
      "Municipal Services",
      "Ministry of Housing & Urban Affairs",
    ],
    [
      "Drinking water supply stopped",
      "There has been no clean tap water in our neighborhood for several days.",
      "Water Supply & Sanitation",
      "Ministry of Jal Shakti",
    ],
    [
      "Road damage",
      "Large potholes and broken pavement on the public highway have caused vehicle damage and accidents.",
      "Roads & Transport",
      "Ministry of Road Transport & Highways",
    ],
  ]

  for (const [subject, description, category, department] of cases) {
    const result = recommendationService.recommendDepartment(subject, description)
    assert.equal(result.predictedCategory, category)
    assert.equal(result.manualReviewRequired, true)
    assert.ok(result.recommendations.length > 0)
    assert.ok(result.recommendations.every((option) => option.category === category))
    assert.ok(result.recommendations.every((option) => option.department === "Responsible local authority"))
    assert.ok(result.recommendations.every((option) =>
      option.localAuthorityTypes.every((type) => taxonomy.CATEGORY_DIRECTORY[category].localAuthorities.includes(type)),
    ))
    assert.ok(taxonomy.CATEGORIES.includes(category))
    assert.ok(taxonomy.DEPARTMENTS.includes(department))
  }
})

test("acceptance fixtures cover every configured category and reject unsupported domains", () => {
  assert.equal(acceptanceFixture.fixtureType, "synthetic-acceptance-tests-not-training-data")
  const coveredCategories = new Set()

  for (const fixture of acceptanceFixture.cases) {
    const result = recommendationService.recommendDepartment(fixture.subject, fixture.description, {
      governmentType: "Central Government",
    })

    if (fixture.expectedCategory === null) {
      assert.equal(result.manualReviewRequired, true, fixture.name)
      assert.equal(result.predictedCategory, null, fixture.name)
      assert.deepEqual(result.recommendations, [], fixture.name)
      if (fixture.intendedCategory) {
        assert.ok(taxonomy.CATEGORIES.includes(fixture.intendedCategory), fixture.name)
        coveredCategories.add(fixture.intendedCategory)
      }
      continue
    }

    coveredCategories.add(fixture.expectedCategory)
    assert.ok(taxonomy.CATEGORIES.includes(fixture.expectedCategory), fixture.name)
    assert.equal(result.predictedCategory, fixture.expectedCategory, fixture.name)
    assert.equal(result.manualReviewRequired, true, fixture.name)
    assert.ok(result.recommendations.length > 0, fixture.name)
    assert.ok(result.recommendations.every((item) => item.category === fixture.expectedCategory), fixture.name)
    if (fixture.expectedDepartment) {
      assert.ok(result.recommendations.some((item) => item.department === fixture.expectedDepartment), fixture.name)
    }
    assert.ok(result.recommendations.every((item) =>
      (item.department === "Responsible local authority" &&
        item.localAuthorityTypes.every((type) => taxonomy.CATEGORY_DIRECTORY[fixture.expectedCategory].localAuthorities.includes(type))) ||
      (taxonomy.CATEGORY_DIRECTORY[fixture.expectedCategory].centralDepartments || []).includes(item.department) ||
      taxonomy.CATEGORY_DIRECTORY[fixture.expectedCategory].tamilNaduDepartments.includes(item.department) ||
      (item.department === taxonomy.CATEGORY_TO_DEPARTMENT[fixture.expectedCategory] && item.sourceEvidence),
    ), fixture.name)
    assert.ok(result.recommendations.every((item) =>
      item.authorityLevel !== "local" || (item.requiresLocation && item.locationPrompt),
    ), fixture.name)
  }

  assert.deepEqual([...coveredCategories].sort(), [...taxonomy.CATEGORIES].sort())
})

test("exact streetlights report classifies as municipal and names the missing local authority", () => {
  const fixture = acceptanceFixture.cases.find(
    (item) => item.name === "exact streetlights near bus stand regression",
  )
  const result = recommendationService.recommendDepartment(
    fixture.subject,
    fixture.description,
    { governmentType: "Central Government" },
  )

  assert.equal(result.predictedCategory, "Municipal Services")
  assert.ok(result.score >= result.scoreThreshold)
  assert.ok(result.rankingMargin >= result.minimumRankingMargin)
  assert.match(result.explanation, /street, lights, night/)
  assert.match(result.explanation, /state\/local options are provided/)
  assert.equal(result.manualReviewRequired, true)
  assert.equal(result.recommendations.length, 1)
  assert.equal(result.recommendations[0].department, "Responsible local authority")
  assert.ok(result.recommendations[0].localAuthorityTypes.includes("Municipal Corporation"))
  assert.ok(result.recommendations[0].localAuthorityTypes.includes("Village Panchayat"))
  assert.equal(result.recommendations[0].requiresLocation, true)
  assert.ok(!result.recommendations.some((item) => item.department === "Ministry of Housing & Urban Affairs"))
})

test("ambiguous and out-of-vocabulary text requires manual review", () => {
  const ambiguous = recommendationService.recommendDepartment(
    "Please help me",
    "This situation is difficult and I need assistance.",
  )
  const unknown = recommendationService.recommendDepartment(
    "Quasar nebula",
    "Zorblax flumetry vextor xalune.",
  )

  assert.equal(ambiguous.manualReviewRequired, true)
  assert.equal(unknown.manualReviewRequired, true)
  assert.equal(unknown.predictedCategory, null)
  assert.ok(unknown.score < 45)
  assert.deepEqual(unknown.recommendations, [])
})

test("configured model score floor can only increase abstention", () => {
  const previous = process.env.DEPARTMENT_RECOMMENDATION_MINIMUM_SCORE
  process.env.DEPARTMENT_RECOMMENDATION_MINIMUM_SCORE = "0.99"
  try {
    const result = recommendationService.recommendDepartment(
      "Scholarship payment delayed",
      "My scholarship amount under the central government scholarship program has not been credited after submitting student documents.",
      { governmentType: "Central Government" },
    )
    assert.equal(result.scoreThreshold, 99)
    assert.equal(result.manualReviewRequired, true)
    assert.deepEqual(result.recommendations, [])
  } finally {
    if (previous === undefined) delete process.env.DEPARTMENT_RECOMMENDATION_MINIMUM_SCORE
    else process.env.DEPARTMENT_RECOMMENDATION_MINIMUM_SCORE = previous
  }
})

test("recommendation endpoint requires JWT, validates lengths, and does not create grievances", async (context) => {
  const app = express()
  app.use(express.json())
  app.use("/api/grievances", require("../src/routes/grievanceRoutes"))

  const server = app.listen(0)
  context.after(() => new Promise((resolve) => server.close(resolve)))

  await new Promise((resolve) => server.once("listening", resolve))
  const address = server.address()
  const url = `http://127.0.0.1:${address.port}/api/grievances/recommend-department`
  const token = jwt.sign({ id: "test-citizen", role: "citizen" }, TEST_JWT_SECRET)
  let createCalls = 0
  Grievance.create = async () => { createCalls += 1 }

  const unauthorized = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject: "Streetlight", description: "A light is broken in my lane." }),
  })
  assert.equal(unauthorized.status, 401)

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
  const valid = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ subject: "NHAI highway potholes", description: "The National Highways Authority has not repaired deep potholes on the national highway.", governmentType: "Central Government" }),
  })
  assert.equal(valid.status, 200)
  const body = await valid.json()
  assert.equal(body.experimental, true)
  assert.equal(body.recommendations[0].department, "Ministry of Road Transport & Highways")
  assert.equal(body.manualReviewRequired, true)
  assert.equal(createCalls, 0)

  const stateRequest = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ subject: "Scholarship payment delayed", description: "My state scholarship payment is delayed after submitting the documents.", governmentType: "State Government", state: "Tamil Nadu" }),
  })
  assert.equal(stateRequest.status, 200)
  const stateBody = await stateRequest.json()
  assert.equal(stateBody.manualReviewRequired, true)
  assert.ok(stateBody.recommendations.length > 0)
  assert.ok(stateBody.recommendations.some((item) => item.authorityLevel === "Tamil Nadu"))
  assert.ok(stateBody.recommendations.every((item) => item.category === stateBody.predictedCategory))

  const stateHighwayRequest = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ subject: "Highway potholes", description: "The National Highways Authority has not repaired deep potholes on the national highway.", governmentType: "State Government", state: "Tamil Nadu" }),
  })
  const stateHighwayBody = await stateHighwayRequest.json()
  assert.equal(stateHighwayRequest.status, 200)
  assert.ok(stateHighwayBody.recommendations.some((item) => item.authorityLevel === "Tamil Nadu"))
  assert.ok(stateHighwayBody.recommendations.every((item) => item.authorityLevel !== "central"))

  const localRequest = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ subject: "Streetlights not working", description: "The streetlights near our bus stand have been broken for several days.", governmentType: "Local Government", state: "Tamil Nadu" }),
  })
  assert.equal(localRequest.status, 200)
  const localBody = await localRequest.json()
  assert.ok(localBody.recommendations.length > 0)
  assert.ok(localBody.recommendations.every((item) => item.authorityLevel === "local"))
  assert.ok(localBody.recommendations.every((item) => item.requiresLocation))

  const missingLocalState = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ subject: "Streetlights not working", description: "The streetlights near our bus stand have been broken for several days.", governmentType: "Local Government" }),
  })
  assert.equal(missingLocalState.status, 400)

  const missingState = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ subject: "Scholarship payment delayed", description: "My state scholarship payment is delayed after submitting the documents.", governmentType: "State Government" }),
  })
  assert.equal(missingState.status, 400)

  const empty = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ subject: "", description: "" }),
  })
  assert.equal(empty.status, 400)

  const malformed = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ subject: ["not", "text"], description: { invalid: true }, governmentType: "Central Government" }),
  })
  assert.equal(malformed.status, 400)

  const oversizedSubject = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ subject: "s".repeat(201), description: "A sufficiently detailed complaint description.", governmentType: "Central Government" }),
  })
  assert.equal(oversizedSubject.status, 400)

  const tooLong = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ subject: "Valid subject", description: "x".repeat(5001) }),
  })
  assert.equal(tooLong.status, 400)
  assert.equal(createCalls, 0)
})

test("recommendation service failures return an explicit unavailable response", () => {
  recommendationService.recommendDepartment = () => { throw new Error("simulated model failure") }
  console.error = () => {}
  const response = responseRecorder()

  recommendationController.recommendDepartment({
    body: { subject: "Road damage", description: "Potholes have damaged this public road.", governmentType: "Central Government" },
  }, response)

  assert.equal(response.statusCode, 503)
  assert.match(response.body.message, /temporarily unavailable/)
  recommendationService.recommendDepartment = savedMethods.recommendDepartment
  console.error = savedMethods.consoleError
})

test("submission preserves manual department and stores AI output separately", async () => {
  const inserted = []
  Grievance.findOne = async () => null
  Grievance.create = async (document) => {
    inserted.push(document)
    return { ...document, _id: `test-grievance-${inserted.length}` }
  }

  const recommendedResponse = responseRecorder()
  await grievanceController.createGrievance({
    body: {
      subject: "NHAI highway potholes",
      description: "The National Highways Authority has not repaired deep potholes on the national highway.",
      department: "Ministry of Home Affairs",
      aiRecommendation: true,
    },
    user: { id: "test-citizen" },
  }, recommendedResponse)

  assert.equal(recommendedResponse.statusCode, 201)
  assert.equal(inserted[0].department, "Ministry of Home Affairs")
  assert.equal(inserted[0].aiRecommendation.category, "Roads & Transport")
  assert.equal(inserted[0].aiRecommendation.department, "Ministry of Road Transport & Highways")

  const ordinaryResponse = responseRecorder()
  await grievanceController.createGrievance({
    body: {
      subject: "Manual selection",
      description: "This grievance was filed with a department chosen by the citizen.",
      department: "Ministry of Power",
    },
    user: { id: "test-citizen" },
  }, ordinaryResponse)

  assert.equal(ordinaryResponse.statusCode, 201)
  assert.equal(inserted[1].department, "Ministry of Power")
  assert.equal(inserted[1].aiRecommendation, undefined)
})

test("submission succeeds when recommendation refresh fails", async () => {
  let createCalls = 0
  Grievance.findOne = async () => null
  Grievance.create = async (document) => {
    createCalls += 1
    return { ...document, _id: "saved-after-model-failure" }
  }
  recommendationService.recommendDepartment = () => { throw new Error("simulated model failure") }
  console.error = () => {}
  const response = responseRecorder()

  await grievanceController.createGrievance({
    body: {
      subject: "Water supply interrupted",
      description: "There has been no water at our home for several days.",
      department: "Ministry of Jal Shakti",
      aiRecommendation: true,
    },
    user: { id: "test-citizen" },
  }, response)

  assert.equal(response.statusCode, 201)
  assert.equal(createCalls, 1)
  assert.equal(response.body.grievance.department, "Ministry of Jal Shakti")
  assert.equal(response.body.grievance.aiRecommendation, null)
})

test("submission persists the selected local body and its locality", async () => {
  let saved
  Grievance.findOne = async () => null
  Grievance.create = async (document) => {
    saved = document
    return { ...document, _id: "saved-local-authority" }
  }
  const response = responseRecorder()

  await grievanceController.createGrievance({
    body: {
      subject: "Streetlights not working",
      description: "The streetlights on our road have failed and residents are unsafe at night.",
      department: "Municipal Corporation",
      governmentType: "State Government",
      state: "Tamil Nadu",
      location: "Chennai district, local corporation area",
    },
    user: { id: "test-citizen" },
  }, response)

  assert.equal(response.statusCode, 201)
  assert.equal(saved.department, "Municipal Corporation")
  assert.equal(saved.state, "Tamil Nadu")
  assert.equal(saved.location, "Chennai district, local corporation area")
})

test("training labels and department mappings cover the shared taxonomy without class imbalance", () => {
  const counts = Object.fromEntries(taxonomy.CATEGORIES.map((category) => [
    category,
    trainingDataset.examples.filter((example) => example.category === category).length,
  ]))

  assert.equal(trainingDataset.datasetType, "synthetic-demo-only")
  assert.equal(acceptanceFixture.fixtureType, "synthetic-acceptance-tests-not-training-data")
  assert.deepEqual(
    Object.entries(taxonomy.CATEGORY_TO_DEPARTMENT).sort(),
    sharedTaxonomy.map(({ category, department }) => [category, department]).sort(),
  )
  assert.deepEqual(Object.keys(counts).sort(), [...taxonomy.CATEGORIES].sort())
  assert.ok(Object.values(counts).every((count) => count === 6))
})