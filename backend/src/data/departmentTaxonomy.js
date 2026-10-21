const configuredTaxonomy = require("../../../shared/grievance-taxonomy.json")
const CATEGORY_TO_DEPARTMENT = Object.freeze(
  Object.fromEntries(configuredTaxonomy.map(({ category, department }) => [category, department])),
)
const CATEGORY_DIRECTORY = Object.freeze(
  Object.fromEntries(configuredTaxonomy.map((item) => [item.category, Object.freeze(item)])),
)

const MANUAL_JURISDICTION_CATEGORIES = Object.freeze([
  "Municipal Services",
])

const CENTRAL_AUTHORITY_SCOPE = Object.freeze({
  "Public Distribution System": /\b(food corporation of india|fci|central food procurement|central food subsidy)\b/i,
  "Electricity & Power": /\b(national grid|power grid corporation|central power policy)\b/i,
  "Water Supply & Sanitation": /\b(jal jeevan mission|central drinking water mission)\b/i,
  "Roads & Transport": /\b(national highway|nhai|national highways authority|morth)\b/i,
  "Health & Family Welfare": /\b(aiims|all india institute of medical sciences|cghs|central government hospital)\b/i,
  Education: /\b(kendriya vidyalaya|navodaya vidyalaya|central government school)\b/i,
  "Pension & Retirement Benefits": /\b(central government employee|central civil pension|central pension rules)\b/i,
  "Municipal Services": null,
  "Police & Law Enforcement": /\b(bsf|border security force|crpf|cisf|itbp|ssb|assam rifles|central armed police)\b/i,
  "Revenue & Land Records": /\b(dilrmp|digital india land records modernization programme|department of land resources)\b/i,
})

const ADDITIONAL_CENTRAL_AUTHORITY_SCOPE = Object.freeze({
  Education: Object.freeze({
    "Department of Higher Education, Ministry of Education": /\b(higher education|university|college|postgraduate|central sector scholarship)\b/i,
  }),
})

module.exports = {
  CATEGORY_TO_DEPARTMENT,
  CATEGORY_DIRECTORY,
  CATEGORIES: Object.freeze(Object.keys(CATEGORY_TO_DEPARTMENT)),
  DEPARTMENTS: Object.freeze(Object.values(CATEGORY_TO_DEPARTMENT)),
  MANUAL_JURISDICTION_CATEGORIES,
  CENTRAL_AUTHORITY_SCOPE,
  ADDITIONAL_CENTRAL_AUTHORITY_SCOPE,
}