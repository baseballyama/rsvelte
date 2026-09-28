import * as $ from 'svelte/internal/server';
import Test from './Test.svelte';

export default function Main($$renderer) {
	let div;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (Test) {
			$$renderer.push('<!--[-->');

			Test($$renderer, {
				get div() {
					return div;
				},

				set div($$value) {
					div = $$value;
					$$settled = false;
				}
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}