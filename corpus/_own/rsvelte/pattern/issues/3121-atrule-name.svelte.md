# `3121-atrule-name.svelte`

**Issue:** [#3121](https://github.com/baseballyama/rsvelte/issues/3121)

An at-rule name is read with the same `read_identifier`, which rejects both an empty name and a leading `-?\d`; rsvelte built an `Atrule` node from whatever came back, so `@ foo` and `@1x` compiled. `@-webkit-keyframes` is the control — a leading `-` followed by a letter is legal
