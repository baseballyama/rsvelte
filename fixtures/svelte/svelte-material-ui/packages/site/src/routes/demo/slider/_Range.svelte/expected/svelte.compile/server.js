import * as $ from 'svelte/internal/server';
import Slider from '@smui/slider';
import Button from '@smui/button';

export default function _Range($$renderer) {
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

		$$renderer.push(`<!----> <div>`);

		Button($$renderer, {
			onclick: () => {
				valueStart = 0;
				valueEnd = 10;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Maximum Range!`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <pre class="status">Value: ${$.escape(valueStart)} - ${$.escape(valueEnd)}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}