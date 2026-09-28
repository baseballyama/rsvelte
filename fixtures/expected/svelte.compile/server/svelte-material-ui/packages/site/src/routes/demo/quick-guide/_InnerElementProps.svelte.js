import * as $ from 'svelte/internal/server';
import Textfield from '@smui/textfield';
import HelperText from '@smui/textfield/helper-text';

export default function _InnerElementProps($$renderer) {
	let value = '';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="margins">`);

		{
			function helper($$renderer) {
				HelperText($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->This field should autocomplete with your name.`);
					},
					$$slots: { default: true }
				});
			}

			Textfield($$renderer, {
				style: 'width: 100%; max-width: 300px;',
				helperLine$style: 'width: 100%; max-width: 300px;',
				input$autocomplete: 'name',
				input$name: 'name',
				label: 'Name',
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