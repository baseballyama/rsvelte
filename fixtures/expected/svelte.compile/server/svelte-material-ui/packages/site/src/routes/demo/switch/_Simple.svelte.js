import * as $ from 'svelte/internal/server';
import Switch from '@smui/switch';
import FormField from '@smui/form-field';
import Button from '@smui/button';

export default function _Simple($$renderer) {
	let checked1 = false;
	let checked2 = false;
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
						get checked() {
							return checked1;
						},

						set checked($$value) {
							checked1 = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----></div> <pre class="status">Checked: ${$.escape(checked1)}</pre> <div style="margin-top: 1em;">`);

		{
			function label($$renderer) {
				$$renderer.push(`<!---->Fields of grain.`);
			}

			FormField($$renderer, {
				align: 'end',
				label,
				children: ($$renderer) => {
					Switch($$renderer, {
						get checked() {
							return checked2;
						},

						set checked($$value) {
							checked2 = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----></div> <div style="margin-top: 1em;">`);

		Button($$renderer, {
			onclick: () => checked2 = !checked2,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Toggle Programmatically`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <pre class="status">Checked: ${$.escape(checked2)}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}