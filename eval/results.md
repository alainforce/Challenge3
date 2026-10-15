# Eval sonuçları (gerçek Gemini)

| Belge | Durum | TP | FN | FP | Precision | Recall | Rejected |
|---|---|---:|---:|---:|---:|---:|---:|
| apple-privacy.txt | failed | 0 | 2 | 0 | 0.00 | 0.00 | 0 |
| spotify-terms.txt | failed | 0 | 1 | 0 | 0.00 | 0.00 | 0 |
| github-privacy.txt | failed | 0 | 2 | 0 | 0.00 | 0.00 | 0 |
| microsoft-services.txt | failed | 0 | 2 | 0 | 0.00 | 0.00 | 0 |
| google-privacy.txt | failed | 0 | 1 | 0 | 0.00 | 0.00 | 0 |

Overall: TP 0, FN 8, FP 0, precision 0.00, recall 0.00, rejected_unverified 0, failed_documents 5.

Failure analysis: this run reached the corrected URL and model, but the API returned quota/capacity errors for failed documents; their gold clauses are counted as operational misses, not evidence that Gemini semantically missed them. Successful model outputs would be compared by exact normalized quote. Paraphrases are rejected and short excerpts can produce Belirsiz. Raw files contain only model JSON or sanitized HTTP errors; the API key is never written.
