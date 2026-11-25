//! `rsvelte typecheck` of a generic component that an instantiation expression gives its type
//! arguments, as `@storybook/addon-svelte-csf`'s `defineMeta` gives its `Story`.

use crate::typecheck::Native;
use crate::typecheck_events::check;

/// `defineMeta`'s shape: a generic `Story` whose `template` snippet reads the args, instantiated
/// with the props of the component it renders.
const STORY: &str = "<script lang=\"ts\" generics=\"TArgs extends Record<string, any>\">\n\
    \timport type { Snippet } from 'svelte';\n\
    \tlet { name, template }: { name: string; template?: Snippet<[TArgs]> } = $props();\n\
    </script>\n<p>{name}</p>\n";
const META: &str = "import type { Component, ComponentProps } from 'svelte';\n\
    import Story from './Story.svelte';\n\
    export function defineMeta<C extends Component<any, any, any>>(meta: { component: C }): \
    { Story: typeof Story<ComponentProps<C>> } {\n\treturn { Story } as any;\n}\n";
const CHILD: &str = "<script lang=\"ts\">\n\tlet { label, value = $bindable() }: \
    { label: string; value?: string } = $props();\n</script>\n<p>{label}{value}</p>\n";

/// The story's `template` snippet, which reads `args` as `body` does.
fn stories(body: &str) -> String {
    format!(
        "<script module lang=\"ts\">\n\timport {{ defineMeta }} from './meta';\n\
         \timport Child from './Child.svelte';\n\
         \tconst {{ Story }} = defineMeta({{ component: Child }});\n</script>\n\
         <script lang=\"ts\">\n\tlet value = $state('');\n</script>\n\
         <Story name=\"Default\">\n\t{{#snippet template(args)}}\n\t\t{body}\n\t{{/snippet}}\n\
         </Story>\n"
    )
}

/// The snippet's `args` are the props of the story's component, spread whole or beside a
/// `bind:`, and a prop they lack is reported. svelte-check 4.7.8 reports only the last line.
#[test]
fn typecheck_types_a_story_snippet_by_the_instantiated_component() {
    let spread = stories("<Child {...args} />");
    let bound = stories("<Child {...args} bind:value />");
    let missing = stories("<Child label={args.missing} />");
    let report = check(&[
        ("src/Story.svelte", STORY),
        ("src/meta.ts", META),
        ("src/Child.svelte", CHILD),
        ("src/Spread.stories.svelte", &spread),
        ("src/Bound.stories.svelte", &bound),
        ("src/Missing.stories.svelte", &missing),
    ]);
    assert_eq!(
        report,
        "src/Missing.stories.svelte(11,22): error TS2339: Property 'missing' does not exist on \
         type '$$ComponentProps'.\n\nFound 1 error in 1 file.\n"
            .native()
    );
}
