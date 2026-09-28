import * as $ from 'svelte/internal/server';
import Checkbox from '@smui/checkbox';
import FormField from '@smui/form-field';
import Button from '@smui/button';

export default function _Indeterminate($$renderer) {
	let checked = null;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		{
			function label($$renderer) {
				$$renderer.push(`<!---->I agree to the terms.`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Checkbox($$renderer, {
						indeterminate: checked === null,
						input$required: true,
						get checked() {
							return checked;
						},

						set checked($$value) {
							checked = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----> <br/> `);

		Button($$renderer, {
			onclick: () => checked = null,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Reset`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <pre class="status">Checked: ${$.escape(checked ?? 'indeterminate')}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}