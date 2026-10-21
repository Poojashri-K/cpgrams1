# Prepared CPGRAMS department data

This folder contains prepared **synthetic examples only**. They are not verified real-world government complaints, and no real-world accuracy claim is supported.

## Files

- `train.csv`: 2330 rows: 60 original JSON examples plus 2270 compatible rows from `grievances_synthetic.csv`.
- `holdout.csv`: 468 compatible rows from `grievances_holdout_templates.csv` only. It was not used to create training examples.
- `preparation-report.json`: source mappings, per-category counts, all excluded CSV records with source IDs/reasons, pension/PF text-classification totals, and duplicate/overlap checks.

## Processing

The output columns are `grievance_text,category`, using the exact project taxonomy names. Existing JSON examples use `subject + one space + description`. CSV grievance text is preserved as supplied. Both municipal source labels (`Municipal Certificates`, `Sanitation & Garbage`) map to `Municipal Services`.

For `Pension & Provident Fund`, only text with explicit pension cues and no provident-fund cues is mapped to `Pension & Retirement Benefits`; explicit EPF/PF/provident-fund text and ambiguous text are excluded. Banking & Financial Services, Employment & Labour, and Corruption & Bribery are excluded because the existing taxonomy has no defensible mapping for them.

Normalized text is checked using Unicode NFKC, lowercase conversion, punctuation/symbol removal, and whitespace normalization. Duplicate and train/holdout overlap records, if any, are retained and enumerated in the report; none are silently removed.

## Category counts

Training: `{"Public Distribution System":213,"Electricity & Power":192,"Water Supply & Sanitation":223,"Roads & Transport":190,"Health & Family Welfare":235,"Education":250,"Pension & Retirement Benefits":140,"Municipal Services":389,"Police & Law Enforcement":240,"Revenue & Land Records":258}`

Holdout: `{"Public Distribution System":41,"Electricity & Power":37,"Water Supply & Sanitation":43,"Roads & Transport":36,"Health & Family Welfare":45,"Education":48,"Pension & Retirement Benefits":47,"Municipal Services":75,"Police & Law Enforcement":46,"Revenue & Land Records":50}`

The examples appear synthetic/template-generated. Holdout results on these examples would not establish real-world performance.

## Training candidate status

The training pipeline can be invoked from the repository root with:

```powershell
node backend/src/scripts/trainDepartmentModel.js
```

It fits TF-IDF and the existing logistic-regression classifier using `train.csv` only, then loads `holdout.csv` for evaluation. Before promotion, it checks the project's synthetic recommendation acceptance fixtures. The candidate trained from these prepared splits was **rejected** because it failed those existing acceptance cases; the restored working model and vectorizer were not replaced by the rejected candidate.

The rejected candidate's synthetic holdout results were accuracy 42.52%, macro precision 65.11%, macro recall 39.10%, and macro F1 34.76% (468 holdout examples). These metrics describe only the generated dataset and do not establish real-world performance.
