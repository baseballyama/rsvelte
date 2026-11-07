import * as $ from 'svelte/internal/server';
import Textfield from '@smui/textfield';
import HelperText from '@smui/textfield/helper-text';

export default function _Disabled($$renderer) {
	$$renderer.push(`<div class="columns margins"><div>`);

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
			disabled: true,
			value: '',
			label: 'Standard',
			helper,
			$$slots: { helper: true }
		});
	}

	$$renderer.push(`<!----></div> <div>`);

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
			variant: 'filled',
			disabled: true,
			value: '',
			label: 'Filled',
			helper,
			$$slots: { helper: true }
		});
	}

	$$renderer.push(`<!----></div> <div>`);

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
			variant: 'outlined',
			disabled: true,
			value: '',
			label: 'Outlined',
			helper,
			$$slots: { helper: true }
		});
	}

	$$renderer.push(`<!----></div></div>`);
}