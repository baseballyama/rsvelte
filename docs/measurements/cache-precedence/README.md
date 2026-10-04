# Precedence experiment records

| Artifact | Content |
|---|---|
| `metadata.json`, `source.json` | Decision, population, source identity and artifact hashes |
| `cache-*.json` | Complete cache-model reports, input/source/tool/binary hashes and samples |
| `cycles-*.json` | Complete actual CPU cycle and instruction reports |
| `three-arms.json` | Rewrite, old Rust and official Svelte on twenty shared inputs |
| `profiles.zip` | Raw counter reports, workload output, errors and function profiles |
| `sources.zip` | Candidate function, test, configs, measured tools and final tools |
| `output-parity.json`, `defect-control.json` | Official AST comparison and a failing/passing test control |

Reconstruct the baseline from `../cache-locality/sources.zip` and its after-source
manifest, then replace the candidate expression file from `sources.zip`.
Use separate target directories for each source tree. Configs retain their original
paths; update paths for the reconstructed trees and executables before running them.
Input files and license records are in the earlier source archive.
