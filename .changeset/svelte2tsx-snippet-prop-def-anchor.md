---
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): anchor component-child `{#snippet}` props via `inst.$$prop_def` so snippet parameters are inferred for value-typed components (#796). A named `{#snippet}` passed as a direct child of a component is lowered as an implicit prop (`new C({ props: { name:(p) => … } })`, #780). rsvelte used the bare instantiation form and never assigned the instance to a const nor destructured the snippet from `inst.$$prop_def`. For an imported `.svelte` component the contextual typing from the props literal was enough, but for a component whose type comes from a **value** — e.g. Storybook CSF's `const { Story } = defineMeta(…)` — `--tsgo` did not propagate the snippet's `Snippet<[Args]>` type and `{#snippet template(args)}` left `args` as implicit `any`. svelte2tsx now matches the official output exactly: the instance is assigned (`const $$_inst = new C({…})`) and each relocated snippet is anchored with `/*Ωignore*/const {name} = $$_inst.$$prop_def;/*Ωignore*/`, which surfaces the snippet prop types to the type-checker. Closes #796.
