import * as $ from 'svelte/internal/server';
import Slider from '@smui/slider';

export default function _TickMarks($$renderer) {
	let value = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Slider($$renderer, {
			min: -100,
			max: 100,
			step: 5,
			discrete: true,
			tickMarks: true,
			'input$aria-label': 'Tick mark slider',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <pre class="status">Value: ${$.escape(value)}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}