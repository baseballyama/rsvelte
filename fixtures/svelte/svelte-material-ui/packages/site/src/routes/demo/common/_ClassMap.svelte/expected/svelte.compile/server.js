import * as $ from 'svelte/internal/server';
import { classMap } from '@smui/common/internal';
import { Label } from '@smui/common';
import Button from '@smui/button';
import FormField from '@smui/form-field';
import Radio from '@smui/radio';
import Checkbox from '@smui/checkbox';

export default function _ClassMap($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let big = false;
		let color = 'red';
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="svelte-ydxhs5">`);

			Button($$renderer, {
				class: classMap({ 'my-button': true, big, [color]: true }),
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->I'm a Colored Button`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="svelte-ydxhs5">`);

			{
				function label($$renderer) {
					$$renderer.push(`<!---->Big`);
				}

				FormField($$renderer, {
					style: 'margin-right: 1em;',
					label,
					children: ($$renderer) => {
						Checkbox($$renderer, {
							get checked() {
								return big;
							},

							set checked($$value) {
								big = $$value;
								$$settled = false;
							}
						});
					},
					$$slots: { label: true, default: true }
				});
			}

			$$renderer.push(`<!----> <!--[-->`);

			const each_array = $.ensure_array_like(['red', 'blue', 'green']);

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
									return color;
								},

								set group($$value) {
									color = $$value;
									$$settled = false;
								}
							});
						},
						$$slots: { label: true, default: true }
					});
				}
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}