import * as $ from 'svelte/internal/server';
import Slider from '@smui/slider';

export default function _MinRange($$renderer) {
	let valueStart = 1;
	let valueEnd = 4;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Slider($$renderer, {
			range: true,
			min: 0,
			max: 10,
			step: 0.1,
			minRange: 1,
			'input$aria-label': 'Min range slider',
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