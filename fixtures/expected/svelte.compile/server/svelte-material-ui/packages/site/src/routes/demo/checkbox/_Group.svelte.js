import * as $ from 'svelte/internal/server';
import Checkbox from '@smui/checkbox';
import FormField from '@smui/form-field';
import Button from '@smui/button';

export default function _Group($$renderer) {
	let options = [
		{ name: 'Bashful', disabled: false },
		{ name: 'Doc', disabled: true },
		{ name: 'Dopey', disabled: false },
		{ name: 'Happy', disabled: false },
		{ name: 'Sleepy', disabled: false },
		{ name: 'Sneezy', disabled: false },
		{ name: 'Grumpy', disabled: false }
	];

	let selected = ['Happy', 'Grumpy'];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div><!--[-->`);

		const each_array = $.ensure_array_like(options);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let option = each_array[$$index];

			{
				function label($$renderer) {
					$$renderer.push(`<!---->${$.escape(option.name)}${$.escape(option.disabled ? ' (disabled)' : '')}`);
				}

				FormField($$renderer, {
					label,
					children: ($$renderer) => {
						Checkbox($$renderer, {
							value: option.name,
							disabled: option.disabled,
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

		$$renderer.push(`<!--]--></div> <div style="margin-top: 1em;">`);

		Button($$renderer, {
			onclick: () => {
				const idx = selected.findIndex((v) => v === 'Doc');

				if (idx > -1) {
					selected.splice(idx, 1);
				} else {
					selected.push('Doc');
				}
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Toggle Doc Programmatically`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <pre class="status">Selected: ${$.escape(selected.join(', '))}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}