# `template-function-this-parameter.svelte`

**Issue:** [#4912](https://github.com/baseballyama/rsvelte/pull/4912), found by the `svar-core` submodule bump, `apps/widget/src/components/TimePicker.svelte`.

Official `parse()` keeps a TypeScript `this` parameter as a leading `Identifier` named `this` in `params`, with its `typeAnnotation`. The script converters already emitted it; the template converters (`create_function_expression` and the template `FunctionDeclaration` arm) read only `params.items` and dropped it, so `parse()` reported one parameter fewer and a missing `Identifier` for every typed `this` in a template expression. The file holds the three template hosts: a function expression attribute, a function declaration nested in its body, and an object method. Compiled output is unchanged, since `remove_typescript_nodes` strips the parameter on both sides.
