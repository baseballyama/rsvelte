import * as $ from 'svelte/internal/server';

export default function Alias_input($$renderer, $$props) {
	const { 'aria-label': foo } = $$props;

	$$renderer.push(`<!---->${$.escape(foo)}`);
}