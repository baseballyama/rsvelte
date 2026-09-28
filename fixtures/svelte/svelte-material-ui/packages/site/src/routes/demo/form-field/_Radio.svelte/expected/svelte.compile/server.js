import * as $ from 'svelte/internal/server';
import FormField from '@smui/form-field';
import Radio from '@smui/radio';

export default function _Radio($$renderer) {
	let selected = 'yes';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(['yes', 'no']);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let option = each_array[$$index];

			{
				function label($$renderer) {
					$$renderer.push(`<!---->${$.escape(`${option[0].toUpperCase()}${option.slice(1)}`)}`);
				}

				FormField($$renderer, {
					style: 'margin-right: 1em;',
					label,
					children: ($$renderer) => {
						Radio($$renderer, {
							value: option,
							get group() {
								return selected;
							},

							set group($$value) {
								selected = $$value;
								$$settled = false;
							}
						});
					},
					$$slots: { label: true, default: true }
				});
			}
		}

		$$renderer.push(`<!--]--> <pre class="status">Selected: ${$.escape(selected)}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}