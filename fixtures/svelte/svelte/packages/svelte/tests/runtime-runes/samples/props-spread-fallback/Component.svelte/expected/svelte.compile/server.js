import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	const { propA, propB = "fallback" } = $$props;

	$$renderer.push(`<p>${$.escape(propA)} ${$.escape(propB)}</p>`);
}