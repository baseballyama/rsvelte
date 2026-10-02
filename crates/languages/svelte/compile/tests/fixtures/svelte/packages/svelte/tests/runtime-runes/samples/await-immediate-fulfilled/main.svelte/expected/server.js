import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let p = null;

		$$renderer.push(`<button>Resolve (immediate)</button> <button>Resolve (timeout)</button> <button>Reject (immediate)</button> <button>Reject (timeout)</button> <p>`);

		$.await(
			$$renderer,
			p,
			() => {
				$$renderer.push(`...`);
			},
			(v) => {
				$$renderer.push(`resolved [${$.escape(v)}]`);
			}
		);

		$$renderer.push(`<!--]--></p>`);
	});
}