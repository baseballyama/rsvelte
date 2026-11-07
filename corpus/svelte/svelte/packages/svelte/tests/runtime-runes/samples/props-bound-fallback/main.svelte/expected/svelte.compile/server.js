import * as $ from 'svelte/internal/server';
import Counter from './Counter.svelte';

export default function Main($$renderer) {
	let bound = void 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<button>${$.escape(bound)}</button> `);

		Counter($$renderer, {
			get count() {
				return bound;
			},

			set count($$value) {
				bound = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}