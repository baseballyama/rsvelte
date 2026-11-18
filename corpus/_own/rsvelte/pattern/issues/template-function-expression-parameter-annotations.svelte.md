# `template-function-expression-parameter-annotations.svelte`

**Issue:** [#4912](https://github.com/baseballyama/rsvelte/pull/4912), found while fixing `template-function-this-parameter.svelte`.

A function expression or object method in a template converted each parameter through its bare binding pattern, so `parse()` lost the parameter's `typeAnnotation`, and an `Identifier`'s `end` stopped before the annotation. The template arrow and `FunctionDeclaration` converters already went through the `FormalParameter`. The file crosses a plain, defaulted, optional, destructured-with-default and rest parameter, plus a defaulted method parameter.
