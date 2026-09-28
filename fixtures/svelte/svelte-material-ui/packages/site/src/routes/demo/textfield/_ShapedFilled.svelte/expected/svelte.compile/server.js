import * as $ from 'svelte/internal/server';
import Textfield from '@smui/textfield';
import Icon from '@smui/textfield/icon';
import HelperText from '@smui/textfield/helper-text';

export default function _ShapedFilled($$renderer) {
	let valueA = '';
	let valueB = '';
	let valueC = '';
	let valueD = '';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="columns margins svelte-gcehlo"><div class="svelte-gcehlo">`);

		{
			function helper($$renderer) {
				HelperText($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Helper Text`);
					},
					$$slots: { default: true }
				});
			}

			Textfield($$renderer, {
				class: 'shaped-filled',
				variant: 'filled',
				label: 'Label',
				get value() {
					return valueA;
				},

				set value($$value) {
					valueA = $$value;
					$$settled = false;
				},
				helper,
				$$slots: { helper: true }
			});
		}

		$$renderer.push(`<!----> <pre class="status svelte-gcehlo">Value: ${$.escape(valueA)}</pre></div> <div class="svelte-gcehlo">`);

		{
			function leadingIcon($$renderer) {
				Icon($$renderer, {
					class: 'material-icons',
					children: ($$renderer) => {
						$$renderer.push(`<!---->event`);
					},
					$$slots: { default: true }
				});
			}

			function helper($$renderer) {
				HelperText($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Helper Text`);
					},
					$$slots: { default: true }
				});
			}

			Textfield($$renderer, {
				class: 'shaped-filled',
				variant: 'filled',
				label: 'Leading Icon',
				get value() {
					return valueB;
				},

				set value($$value) {
					valueB = $$value;
					$$settled = false;
				},
				leadingIcon,
				helper,
				$$slots: { leadingIcon: true, helper: true }
			});
		}

		$$renderer.push(`<!----> <pre class="status svelte-gcehlo">Value: ${$.escape(valueB)}</pre></div> <div class="svelte-gcehlo">`);

		{
			function trailingIcon($$renderer) {
				Icon($$renderer, {
					class: 'material-icons',
					children: ($$renderer) => {
						$$renderer.push(`<!---->delete`);
					},
					$$slots: { default: true }
				});
			}

			function helper($$renderer) {
				HelperText($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Helper Text`);
					},
					$$slots: { default: true }
				});
			}

			Textfield($$renderer, {
				class: 'shaped-filled',
				variant: 'filled',
				label: 'Trailing Icon',
				get value() {
					return valueC;
				},

				set value($$value) {
					valueC = $$value;
					$$settled = false;
				},
				trailingIcon,
				helper,
				$$slots: { trailingIcon: true, helper: true }
			});
		}

		$$renderer.push(`<!----> <pre class="status svelte-gcehlo">Value: ${$.escape(valueC)}</pre></div> <div class="svelte-gcehlo">`);

		{
			function helper($$renderer) {
				HelperText($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Helper Text`);
					},
					$$slots: { default: true }
				});
			}

			Textfield($$renderer, {
				class: 'shaped-filled',
				variant: 'filled',
				invalid: true,
				label: 'Invalid',
				get value() {
					return valueD;
				},

				set value($$value) {
					valueD = $$value;
					$$settled = false;
				},
				helper,
				$$slots: { helper: true }
			});
		}

		$$renderer.push(`<!----> <pre class="status svelte-gcehlo">Value: ${$.escape(valueD)}</pre></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}