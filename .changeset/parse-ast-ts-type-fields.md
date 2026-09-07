---
'@rsvelte/compiler': patch
'@rsvelte/vite-plugin-svelte-native': patch
---

fix(parse): keep TypeScript type fields on `parse()` output

`parse()` erased every type annotation from a `lang="ts"` script: acorn-typescript
stamps the annotation on the node it belongs to, and rsvelte emitted the node
without it. Nine fields are now carried through — `CallExpression.typeArguments`,
`NewExpression.typeArguments`, `FunctionExpression.returnType`,
`ArrowFunctionExpression.returnType`, `ClassDeclaration.typeParameters`,
`ClassDeclaration.superTypeParameters`, `MethodDefinition.typeParameters`,
`PropertyDefinition.typeAnnotation` and `VariableDeclarator.definite` — with the
spans and `loc` upstream writes, and omitted (rather than written empty) wherever
upstream omits them.

Generated code is unaffected: these are output-only fields on the JSON surface.
