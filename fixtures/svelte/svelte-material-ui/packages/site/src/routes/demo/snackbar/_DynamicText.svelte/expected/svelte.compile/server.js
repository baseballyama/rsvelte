import * as $ from 'svelte/internal/server';
import Snackbar, { Actions, Label } from '@smui/snackbar';
import Button from '@smui/button';
import IconButton, { Icon } from '@smui/icon-button';
import Textfield from '@smui/textfield';

export default function _DynamicText($$renderer) {
	let snackbar;
	let text = 'This is a snackbar with dynamic text.';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Snackbar($$renderer, {
			labelText: text,
			timeoutMs: -1,
			children: ($$renderer) => {
				Label($$renderer, {});
				$$renderer.push(`<!----> `);

				Actions($$renderer, {
					children: ($$renderer) => {
						IconButton($$renderer, {
							title: 'Dismiss',
							children: ($$renderer) => {
								Icon($$renderer, {
									class: 'material-icons',
									children: ($$renderer) => {
										$$renderer.push(`<!---->close`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Textfield($$renderer, {
			label: 'Dynamic Text',
			required: true,
			get value() {
				return text;
			},

			set value($$value) {
				text = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => snackbar.open(),
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Open Snackbar`);
					},
					$$slots: { default: true }
				});
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