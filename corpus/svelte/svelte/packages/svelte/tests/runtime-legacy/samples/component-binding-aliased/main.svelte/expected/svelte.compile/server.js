import * as $ from 'svelte/internal/server';
import Widget from './Widget.svelte';

export default function Main($$renderer) {
	let bar;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Widget($$renderer, {
			get bar() {
				return bar;
			},

			set bar($$value) {
				bar = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <div>${$.escape(bar)}</div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}