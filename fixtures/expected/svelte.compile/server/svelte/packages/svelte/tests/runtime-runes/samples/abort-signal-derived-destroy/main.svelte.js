import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let count = 0;
	let aborted = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<!---->${$.escape(aborted)} <button>increment</button> `);

		if (count % 2 === 0) {
			$$renderer.push('<!--[0-->');

			Child($$renderer, {
				count,
				get aborted() {
					return aborted;
				},

				set aborted($$value) {
					aborted = $$value;
					$$settled = false;
				}
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}