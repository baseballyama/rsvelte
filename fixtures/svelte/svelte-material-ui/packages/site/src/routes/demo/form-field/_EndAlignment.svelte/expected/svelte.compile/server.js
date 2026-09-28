import * as $ from 'svelte/internal/server';
import FormField from '@smui/form-field';
import Checkbox from '@smui/checkbox';

export default function _EndAlignment($$renderer) {
	let checked = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		{
			function label($$renderer) {
				$$renderer.push(`<!---->The input can be aligned at the end too.`);
			}

			FormField($$renderer, {
				align: 'end',
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