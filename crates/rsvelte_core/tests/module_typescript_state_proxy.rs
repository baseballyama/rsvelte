use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

#[test]
fn assignment_from_a_typed_module_parameter_is_proxied() {
    let source = r#"<script module lang="ts">
	function useActiveHeading(headings: MarkdownHeading[]) {
		let activeHeading = $state<MarkdownHeading>();
		$effect(() => {
			const observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						const id = `#${entry.target.getAttribute('id')}`;
						const heading = headings.find((heading) => `#${heading.slug}` === id);
						if (entry?.isIntersecting) {
							activeHeading = heading;
						}
					}
				},
				{ rootMargin: '0px 0px -85% 0px' },
			);
			return () => observer.disconnect();
		});
	}
</script>

<script lang="ts">
	interface Props { headings: MarkdownHeading[]; }
	const { headings }: Props = $props();
	const activeHeading = $derived(useActiveHeading(headings));
</script>

<p>{activeHeading()?.slug}</p>"#;
    let out = compile(
        source,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    assert!(out.contains("$.set(activeHeading, heading, true)"), "{out}");
}
