import * as $ from 'svelte/internal/server';
import Textfield from '@smui/textfield';
import { Icon as CommonIcon } from '@smui/common';

export default function _ElementsInLabel($$renderer) {
	let valueElementsLabel = '';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="margins">`);

		{
			function label($$renderer) {
				CommonIcon($$renderer, {
					class: 'material-icons',
					style: 'font-size: 1em; line-height: normal; vertical-align: top;',
					children: ($$renderer) => {
						$$renderer.push(`<!---->email`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> Email`);
			}

			Textfield($$renderer, {
				type: 'email',
				get value() {
					return valueElementsLabel;
				},

				set value($$value) {
					valueElementsLabel = $$value;
					$$settled = false;
				},
				label,
				$$slots: { label: true }
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