# `2662-template-literal-fold.svelte`

**Issue:** [#2662](https://github.com/baseballyama/rsvelte/issues/2662)

A template literal whose interpolations are all constants. Upstream's `scope.evaluate` walks the quasis and folds; rsvelte accepted a backtick literal only when it contained no `${`, so the read stayed a live reference on client, server **and** client-dev. The value is right at runtime — a divergence only output equality can see
