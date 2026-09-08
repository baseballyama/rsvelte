# `3530-server-const-alias-opaque-write.svelte`

**Issue:** [#3530](https://github.com/baseballyama/rsvelte/issues/3530)

The same defect reached by two writes the textual reassignment scan in `extract_constant_vars` cannot see: `<<=` (its vocabulary is `=`, `+=`, `-=`, `*=`, `/=`, `++`, `--`) and an assignment inside a function body. A fix that only reordered that scan passes the file above and fails this one
