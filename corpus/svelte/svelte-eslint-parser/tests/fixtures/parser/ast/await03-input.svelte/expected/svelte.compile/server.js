import * as $ from 'svelte/internal/server';

export default function Await03_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let expression = new Promise();

		$.await($$renderer, expression, () => {}, () => {});
		$$renderer.push(`<!--]--> `);
		$.await($$renderer, expression, () => {}, () => {});
		$$renderer.push(`<!--]--> `);
		$.await($$renderer, expression, () => {}, () => {});
		$$renderer.push(`<!--]-->`);
	});
}