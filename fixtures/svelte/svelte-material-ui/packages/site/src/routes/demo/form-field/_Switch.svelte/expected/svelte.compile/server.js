import * as $ from 'svelte/internal/server';
import FormField from '@smui/form-field';
import Switch from '@smui/switch';

export default function _Switch($$renderer) {
	let agreed = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		{
			function label($$renderer) {
				$$renderer.push(`<!---->I agree to the terms and conditions of the software, <small style="opacity: .4;">and hereby sign away my rights just to use this app.</small>`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Switch($$renderer, {
						get checked() {
							return agreed;
						},

						set checked($$value) {
							agreed = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----> <pre class="status">Agreed: ${$.escape(agreed ? 'Yes, muahahah.' : 'Not yet.')}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}