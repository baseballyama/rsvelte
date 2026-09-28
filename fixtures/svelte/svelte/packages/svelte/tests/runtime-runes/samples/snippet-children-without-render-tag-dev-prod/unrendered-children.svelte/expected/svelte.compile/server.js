import * as $ from 'svelte/internal/server';

export default function Unrendered_children($$renderer, $$props) {
	let { children } = $$props;

	$$renderer.push(`<!---->${$.escape(children)}`);
}