import * as $ from 'svelte/internal/server';
import A from "./B.svelte";
import B from "./A.svelte";

export default function Main($$renderer) {
	let value = 0;
	let Comp = $.derived(() => value % 2 === 0 ? A : B);

	$$renderer.push(`<button>click</button> `);

	$.css_props(
		$$renderer,
		true,
		{ '--prop': 'red' },
		() => {
			if (Comp()) {
				$$renderer.push('<!--[-->');
				Comp()($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		true
	);
}