import * as $ from 'svelte/internal/server';
import Counter from './Counter.svelte';

export default function Main($$renderer) {
	let object = { shared: { count: 0 }, notshared: { count: 0 } };
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Counter($$renderer, {
			notshared: object.notshared,
			get shared() {
				return object.shared;
			},

			set shared($$value) {
				object.shared = $$value;
				$$settled = false;
			}
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}