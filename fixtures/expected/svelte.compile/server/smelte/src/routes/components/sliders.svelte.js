import * as $ from 'svelte/internal/server';
import Slider from "components/Slider";
import Checkbox from "components/Checkbox";
import Code from "docs/Code.svelte";
import sliders from "examples/sliders.txt";

export default function Sliders($$renderer) {
	let value = 0;
	let value2 = 0;
	let value3 = 0;
	let disabled = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="my-4">`);

		Checkbox($$renderer, {
			label: 'Disabled',
			get checked() {
				return disabled;
			},

			set checked($$value) {
				disabled = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div> <h6>Basic</h6> <small>Value: ${$.escape(value)}</small> `);

		Slider($$renderer, {
			min: '0',
			max: '100',
			disabled,
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <h6 class="mt-8">With color prop</h6> <small>Value: ${$.escape(value3)}</small> `);

		Slider($$renderer, {
			color: 'secondary',
			min: '0',
			max: '100',
			disabled,
			get value() {
				return value3;
			},

			set value($$value) {
				value3 = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <h6 class="mt-8">With steps</h6> <small>Value: ${$.escape(value2)}</small> `);

		Slider($$renderer, {
			min: '0',
			step: '20',
			max: '100',
			disabled,
			get value() {
				return value2;
			},

			set value($$value) {
				value2 = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);
		Code($$renderer, { code: sliders });
		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}