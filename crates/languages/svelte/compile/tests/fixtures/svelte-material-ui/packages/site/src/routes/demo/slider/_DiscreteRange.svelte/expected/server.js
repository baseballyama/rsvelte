import * as $ from 'svelte/internal/server';
import Slider from '@smui/slider';

export default function _DiscreteRange($$renderer) {
	let valueStart = 4;
	let valueEnd = 6;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Slider($$renderer, {
			range: true,
			min: 0,
			max: 10,
			step: 1,
			discrete: true,
			tickMarks: true,
			'input$aria-label': 'Range slider',
			get start() {
				return valueStart;
			},

			set start($$value) {
				valueStart = $$value;
				$$settled = false;
			},

			get end() {
				return valueEnd;
			},

			set end($$value) {
				valueEnd = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <pre class="status">Value: ${$.escape(valueStart)} - ${$.escape(valueEnd)}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}