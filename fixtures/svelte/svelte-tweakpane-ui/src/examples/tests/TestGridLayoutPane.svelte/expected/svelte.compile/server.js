import * as $ from 'svelte/internal/server';
import { Checkbox, Pane, Slider } from '$lib';

export default function TestGridLayoutPane($$renderer) {
	let colors = 0.95;
	let darkMode = true;
	let numbers = true;
	let oneMore = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="layout-wrapper svelte-yzcc6p"></div> `);

		Pane($$renderer, {
			position: 'inline',
			theme: { bladeValueWidth: '244px' },
			width: 337,
			children: ($$renderer) => {
				Slider($$renderer, {
					label: 'Colors',
					max: 1,
					min: 0,
					get value() {
						return colors;
					},

					set value($$value) {
						colors = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					label: 'Dark Mode',
					get value() {
						return darkMode;
					},

					set value($$value) {
						darkMode = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					label: 'Numbers',
					get value() {
						return numbers;
					},

					set value($$value) {
						numbers = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Checkbox($$renderer, {
					label: 'One More',
					get value() {
						return oneMore;
					},

					set value($$value) {
						oneMore = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
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