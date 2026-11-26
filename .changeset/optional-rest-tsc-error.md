---
'@rsvelte/cli': patch
---

`rsvelte lint` reports what typescript-eslint throws for an optional rest element in an arrow function's parameters, such as `([...a?]) => {}`: "Expression expected." at the token after the `?`. Before, it ran the rules on the script as if it parsed.
