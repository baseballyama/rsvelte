import * as $ from 'svelte/internal/server';
import Textfield from '@smui/textfield';
import HelperText from '@smui/textfield/helper-text';

export default function _FullWidth($$renderer) {
	let value = '';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="margins">`);

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
				style: 'width: 100%;',
				helperLine$style: 'width: 100%;',
				label: 'Label',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				},
				helper,
				$$slots: { helper: true }
			});
		}

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}