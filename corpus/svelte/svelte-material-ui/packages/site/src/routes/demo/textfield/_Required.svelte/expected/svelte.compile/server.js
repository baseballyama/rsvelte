import * as $ from 'svelte/internal/server';
import Textfield from '@smui/textfield';

export default function _Required($$renderer) {
	let valueA = '';
	let valueB = '';
	let valueC = '';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="columns margins"><div>`);

		Textfield($$renderer, {
			label: 'Standard',
			required: true,
			get value() {
				return valueA;
			},

			set value($$value) {
				valueA = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <pre class="status">Value: ${$.escape(valueA)}</pre></div> <div>`);

		Textfield($$renderer, {
			variant: 'filled',
			label: 'Filled',
			required: true,
			get value() {
				return valueB;
			},

			set value($$value) {
				valueB = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <pre class="status">Value: ${$.escape(valueB)}</pre></div> <div>`);

		Textfield($$renderer, {
			variant: 'outlined',
			label: 'Outlined',
			required: true,
			get value() {
				return valueC;
			},

			set value($$value) {
				valueC = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <pre class="status">Value: ${$.escape(valueC)}</pre></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}