import * as $ from 'svelte/internal/server';
import { DateField } from "bits-ui";

export default function Date_field_test($$renderer, $$props) {
	let { value, placeholder, name, $$slots, $$events, ...restProps } = $$props;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<main><button data-testid="reset">Reset</button> <div data-testid="value">${$.escape(value)}</div> `);

		if (DateField.Root) {
			$$renderer.push('<!--[-->');

			DateField.Root($$renderer, $.spread_props([
				restProps,
				{
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					},

					get placeholder() {
						return placeholder;
					},

					set placeholder($$value) {
						placeholder = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<div>`);

						if (DateField.Label) {
							$$renderer.push('<!--[-->');

							DateField.Label($$renderer, {
								'data-testid': 'label',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Label`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						{
							function children($$renderer, { segments }) {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(segments);

								for (let i = 0, $$length = each_array.length; i < $$length; i++) {
									let { part, value } = each_array[i];

									if (DateField.Segment) {
										$$renderer.push('<!--[-->');

										DateField.Segment($$renderer, {
											part,
											'data-testid': part === "literal" ? undefined : part,
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(value)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}

								$$renderer.push(`<!--]-->`);
							}

							if (DateField.Input) {
								$$renderer.push('<!--[-->');

								DateField.Input($$renderer, {
									'data-testid': 'input',
									name,
									children,
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(`</div>`);
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</main>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}