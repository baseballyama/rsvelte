import * as $ from 'svelte/internal/server';
import Counter from './Counter.svelte';

export default function Main($$renderer) {
	let x;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Counter($$renderer, {
			get count() {
				return x;
			},

			set count($$value) {
				x = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <p>count: ${$.escape(x)}</p>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}