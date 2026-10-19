# Sample funded-account rule text and its expected Read-Back

Paste this on **Funded → Write your rules** (it is covered by `src/features/funded/ruleText.test.ts`):

> Mera 10k ka account hai. Target 8% hai, rozana loss 5% pichle din ke balance se, kul loss 10% static. Kam az kam 4 din trade karna hai. News par trading nahi. Weekend hold nahi kar sakte.

Expected draft:

| Rule | Value | Status |
|---|---|---|
| Starting balance | $10,000 | Clear |
| Profit target | 8% = $800 | Clear |
| Daily loss | 5% · each day's starting balance · equity · reset 00:00 UTC | Assumed (reset time and equity must be confirmed) |
| Max loss | 10% = $1,000 · static · equity | Clear |
| Minimum trading days | 4 | Clear |
| Consistency | – | Missing → question |
| Costs count | – | Missing → question |
| News rule | "News par trading nahi" | Clear (not auto-checked) |
| Weekend rule | "Weekend hold nahi kar sakte" | Clear (not auto-checked) |
| EAs | Unknown | Missing → question |

Worked example shown: *On a $10,000 account, if yesterday's ending balance was $10,300 and the daily loss is 5%, your equity must not go below $9,785 today.*
