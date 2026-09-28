import * as $ from 'svelte/internal/server';
import Switch from '@smui/switch';
import FormField from '@smui/form-field';
import Button from '@smui/button';

export default function _Events($$renderer) {
	let checked = false;
	let event = void 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div>`);

		{
			function label($$renderer) {
				$$renderer.push(`<!---->Fields of grain.`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Switch($$renderer, {
						onSMUISwitchChange: (e) => event = e,
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

		$$renderer.push(`<!----></div> <div style="margin-top: 1em;">`);

		Button($$renderer, {
			onclick: () => checked = !checked,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Toggle Programmatically`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> (Notice that this doesn't fire an event.)</div> <pre class="status">Checked: ${$.escape(checked)}, Event: ${$.escape(event ? JSON.stringify(event.detail) : 'None yet.')}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}