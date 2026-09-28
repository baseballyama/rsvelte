import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	let { prop = '', children } = $$props;

	$$renderer.push(`<div>${$.escape(prop)}`);
	children($$renderer);
	$$renderer.push(`<!----></div>`);
}