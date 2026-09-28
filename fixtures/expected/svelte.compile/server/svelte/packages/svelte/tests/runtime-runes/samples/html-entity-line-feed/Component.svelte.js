import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	const { text } = $$props;

	$$renderer.push(`<span id="prop">${$.escape(text)}</span>`);
}