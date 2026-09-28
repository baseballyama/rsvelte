import * as $ from 'svelte/internal/server';
import Counter from './Counter.svelte';

export default function Main($$renderer) {
	let bound = 0;
	let bound_nested = { count: 0 };
	let unbound = 0;
	let unbound_nested = { count: 0 };
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<p>${$.escape(bound)} ${$.escape(bound_nested.count)} 0 ${$.escape(unbound_nested.count)}</p> `);

		Counter($$renderer, {
			get count() {
				return bound;
			},

			set count($$value) {
				bound = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Counter($$renderer, {
			get count() {
				return bound_nested.count;
			},

			set count($$value) {
				bound_nested.count = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);
		Counter($$renderer, { count: unbound });
		$$renderer.push(`<!----> `);
		Counter($$renderer, { count: unbound_nested.count });
		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}