import * as $ from 'svelte/internal/server';
import Checkbox from '@smui/checkbox';
import FormField from '@smui/form-field';

export default function _TransitionsAndColor($$renderer) {
	let liftMeUp = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		{
			function label($$renderer) {
				$$renderer.push(`<!---->You raise me up, so I can stand on mountains!`);
			}

			FormField($$renderer, {
				label,
				children: ($$renderer) => {
					Checkbox($$renderer, {
						get checked() {
							return liftMeUp;
						},

						set checked($$value) {
							liftMeUp = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { label: true, default: true }
			});
		}

		$$renderer.push(`<!----> <br/><br/> <div class="flexy-dad svelte-1grftjr"><div${$.attr_class('mdc-elevation-transition rounded flexy-boy svelte-1grftjr', void 0, { 'mdc-elevation--z4': liftMeUp })}>Standard</div> <div${$.attr_class('my-primary mdc-elevation-transition rounded flexy-boy svelte-1grftjr', void 0, { 'elevated': liftMeUp })}>Primary</div> <div${$.attr_class('my-secondary mdc-elevation-transition rounded flexy-boy svelte-1grftjr', void 0, { 'elevated': liftMeUp })}>Secondary</div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}