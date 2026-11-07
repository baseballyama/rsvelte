import * as $ from 'svelte/internal/server';

export default function Child2($$renderer, $$props) {
	let { disabled = false } = $$props;

	$$renderer.push(`<!---->${$.escape(disabled)}`);
}