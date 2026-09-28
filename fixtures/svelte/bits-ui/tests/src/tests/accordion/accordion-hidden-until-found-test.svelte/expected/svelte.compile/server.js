import * as $ from 'svelte/internal/server';
import { Accordion } from "bits-ui";

export default function Accordion_hidden_until_found_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = "",
			hiddenUntilFound = true,
			items = [],
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<main><p data-testid="binding">${$.escape(value)}</p> `);

			if (Accordion.Root) {
				$$renderer.push('<!--[-->');

				Accordion.Root($$renderer, $.spread_props([
					{ 'data-testid': 'root', type: 'single' },
					restProps,
					{
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(items);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let { value: itemValue, title, disabled, content, level } = each_array[$$index];

								if (Accordion.Item) {
									$$renderer.push('<!--[-->');

									Accordion.Item($$renderer, {
										value: itemValue,
										disabled,
										'data-testid': `${$.stringify(itemValue)}-item`,
										children: ($$renderer) => {
											if (Accordion.Header) {
												$$renderer.push('<!--[-->');

												Accordion.Header($$renderer, {
													level,
													'data-testid': `${$.stringify(itemValue)}-header`,
													children: ($$renderer) => {
														if (Accordion.Trigger) {
															$$renderer.push('<!--[-->');

															Accordion.Trigger($$renderer, {
																disabled,
																'data-testid': `${$.stringify(itemValue)}-trigger`,
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
													'data-testid': `${$.stringify(itemValue)}-content`,
													hiddenUntilFound,
													children: ($$renderer) => {
														$$renderer.push(`<div${$.attr('data-testid', `${$.stringify(itemValue)}-searchable-content`)}>${$.escape(content)} This is some searchable content that should be found by the browser's
						search functionality. Lorem ipsum dolor sit amet, consectetur adipiscing elit. <p${$.attr('data-testid', `${$.stringify(itemValue)}-nested-content`)}>Nested paragraph with more searchable text.</p></div>`);
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

			$$renderer.push(` <button data-testid="alt-trigger">Toggle</button></main>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}