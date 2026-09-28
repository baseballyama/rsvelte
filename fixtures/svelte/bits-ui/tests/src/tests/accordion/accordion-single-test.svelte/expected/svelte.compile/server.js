import * as $ from 'svelte/internal/server';
import { Accordion } from "bits-ui";

export default function Accordion_single_test($$renderer, $$props) {
	let {
		disabled = false,
		items = [],
		value = "",
		$$slots,
		$$events,
		...restProps
	} = $$props;

	if (Accordion.Root) {
		$$renderer.push('<!--[-->');

		Accordion.Root($$renderer, $.spread_props([
			{ value, disabled, 'data-testid': 'root', type: 'single' },
			restProps,
			{
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(items);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let { value, title, disabled, content, level } = each_array[$$index];

						if (Accordion.Item) {
							$$renderer.push('<!--[-->');

							Accordion.Item($$renderer, {
								value,
								disabled,
								'data-testid': `${$.stringify(value)}-item`,
								children: ($$renderer) => {
									if (Accordion.Header) {
										$$renderer.push('<!--[-->');

										Accordion.Header($$renderer, {
											level,
											'data-testid': `${$.stringify(value)}-header`,
											children: ($$renderer) => {
												if (Accordion.Trigger) {
													$$renderer.push('<!--[-->');

													Accordion.Trigger($$renderer, {
														disabled,
														'data-testid': `${$.stringify(value)}-trigger`,
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(title)}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Accordion.Content) {
										$$renderer.push('<!--[-->');

										Accordion.Content($$renderer, {
											'data-testid': `${$.stringify(value)}-content`,
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(content)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
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
				},
				$$slots: { default: true }
			}
		]));

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}