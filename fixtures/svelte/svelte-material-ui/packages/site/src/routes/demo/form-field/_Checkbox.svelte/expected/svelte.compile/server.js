import * as $ from 'svelte/internal/server';
import FormField from '@smui/form-field';
import Checkbox from '@smui/checkbox';

export default function _Checkbox($$renderer) {
	let checked = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		{
			function label($$renderer) {
				$$renderer.push(`<!---->Form fields let you click the label to toggle or focus the form control.`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Checkbox($$renderer, {
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

		$$renderer.push(`<!----> <pre class="status">Checked: ${$.escape(checked ? 'Yes' : 'No')}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}