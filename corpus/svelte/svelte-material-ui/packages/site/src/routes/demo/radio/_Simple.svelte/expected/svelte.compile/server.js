import * as $ from 'svelte/internal/server';
import Radio from '@smui/radio';
import FormField from '@smui/form-field';
import Button from '@smui/button';

export default function _Simple($$renderer) {
	let options = [
		{ name: 'Bashful', disabled: false },
		{ name: 'Doc', disabled: true },
		{ name: 'Dopey', disabled: false },
		{ name: 'Happy', disabled: false },
		{ name: 'Sleepy', disabled: false },
		{ name: 'Sneezy', disabled: false },
		{ name: 'Grumpy', disabled: false }
	];

	let selected = 'Grumpy';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="radio-demo svelte-bhrlk1"><!--[-->`);

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
						Radio($$renderer, {
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
				selected = 'Doc';
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Select Doc Programmatically`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <pre class="status">Selected: ${$.escape(selected)}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}