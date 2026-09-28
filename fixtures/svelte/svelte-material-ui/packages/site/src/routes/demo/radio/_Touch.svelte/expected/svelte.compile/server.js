import * as $ from 'svelte/internal/server';
import Radio from '@smui/radio';
import FormField from '@smui/form-field';

export default function _Touch($$renderer) {
	let onoff = 'On';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="radio-demo svelte-jw62yo"><!--[-->`);

		const each_array = $.ensure_array_like(['On', 'Off']);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let option = each_array[$$index];

			{
				function label($$renderer) {
					$$renderer.push(`<!---->${$.escape(option)}`);
				}

				FormField($$renderer, {
					label,
					children: ($$renderer) => {
						Radio($$renderer, {
							value: option,
							touch: true,
							get group() {
								return onoff;
							},

							set group($$value) {
								onoff = $$value;
								$$settled = false;
							}
						});
					},
					$$slots: { label: true, default: true }
				});
			}
		}

		$$renderer.push(`<!--]--></div> <pre class="status">Selected: ${$.escape(onoff)}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}