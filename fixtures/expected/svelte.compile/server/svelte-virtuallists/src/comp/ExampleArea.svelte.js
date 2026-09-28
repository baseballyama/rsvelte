import * as $ from 'svelte/internal/server';
import Highlighted from './Highlighted.svelte';

export default function ExampleArea($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { example } = $$props;

		//@ts-ignore
		const Comp = example.component;

		$$renderer.push(`<div>`);
		Comp($$renderer, {});
		$$renderer.push(`<!----> `);
		Highlighted($$renderer, { lang: 'svelte', highlighted: example.highlightedHTML });
		$$renderer.push(`<!----></div>`);
	});
}