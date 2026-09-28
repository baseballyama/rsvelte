import * as $ from 'svelte/internal/server';
import { RichSelect, Button, Text, Segmented, Field, DatePicker } from "@svar-ui/svelte-core";
import Lock from "./Lock.svelte";
import { getData } from "../data";

export default function Form($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { segmentedOptions, location, positions } = getData();
		let value = 1;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="column svelte-1edxl3m"><div class="segmented svelte-1edxl3m">`);

			{
				function children($$renderer, { option }) {
					if (option.icon) {
						$$renderer.push(`<!--[0--><i${$.attr_class(`icon ${$.stringify(option.icon)}`, 'svelte-1edxl3m')}></i>`);
					} else {
						$$renderer.push(`<!--[-1--><span class="icon svelte-1edxl3m">`);
						Lock($$renderer, {});
						$$renderer.push(`<!----></span>`);
					}

					$$renderer.push(`<!--]--> <span class="bottom">${$.escape(option.name)}</span>`);
				}

				Segmented($$renderer, {
					options: segmentedOptions,
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					},
					children,
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!----></div> <div class="form svelte-1edxl3m">`);

			if (value === 1) {
				$$renderer.push('<!--[0-->');

				{
					function children($$renderer, { id }) {
						Text($$renderer, { value: "Bethany", id });
					}

					Field($$renderer, {
						label: 'First name',
						position: 'top',
						children,
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { id }) {
						Text($$renderer, { value: "Williams", id });
					}

					Field($$renderer, {
						label: 'Last name',
						position: 'top',
						children,
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { id }) {
						DatePicker($$renderer, { value: new Date(2005, 9, 10), width: '100%', id });
					}

					Field($$renderer, { label: 'Birthday', children, $$slots: { default: true } });
				}

				$$renderer.push(`<!----> `);

				Field($$renderer, {
					label: 'Location',
					position: 'top',
					children: ($$renderer) => {
						{
							function children($$renderer, option) {
								$$renderer.push(`<!---->${$.escape(option.name)}`);
							}

							RichSelect($$renderer, {
								options: location,
								value: 1,
								children,
								$$slots: { default: true }
							});
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Field($$renderer, {
					label: 'Position',
					position: 'top',
					children: ($$renderer) => {
						{
							function children($$renderer, option) {
								$$renderer.push(`<!---->${$.escape(option.name)}`);
							}

							RichSelect($$renderer, {
								options: positions,
								value: 1,
								children,
								$$slots: { default: true }
							});
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');

				{
					function children($$renderer, { id }) {
						Text($$renderer, { value: "williams.b", id });
					}

					Field($$renderer, {
						label: 'Username',
						position: 'top',
						children,
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { id }) {
						Text($$renderer, { value: "978548753974", id });
					}

					Field($$renderer, {
						label: 'Phone number',
						position: 'top',
						children,
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { id }) {
						Text($$renderer, { value: "williams.bethany@mail.com", id });
					}

					Field($$renderer, { label: 'Email', children, $$slots: { default: true } });
				}

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { id }) {
						Text($$renderer, {
							value: "123456789",
							id,
							type: "password",
							icon: "wxi-eye",
							css: 'wx-icon-right'
						});
					}

					Field($$renderer, {
						label: 'Current password',
						position: 'top',
						children,
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { id }) {
						Text($$renderer, {
							value: "987654321",
							id,
							type: "password",
							icon: "wxi-eye",
							css: 'wx-icon-right'
						});
					}

					Field($$renderer, {
						label: 'New password',
						position: 'top',
						children,
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]--> `);
			Button($$renderer, { type: "primary", text: "Save" });
			$$renderer.push(`<!----></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}