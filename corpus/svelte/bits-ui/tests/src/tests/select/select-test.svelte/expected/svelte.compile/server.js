import * as $ from 'svelte/internal/server';
import "../../app.css";
import { Select } from "bits-ui";
import { generateTestId } from "../helpers/select";

export default function Select_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			contentProps,
			portalProps,
			items,
			value = "",
			open = false,
			searchValue = "",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const filteredItems = $.derived(() => searchValue === ""
			? items
			: items.filter((item) => item.label.toLowerCase().includes(searchValue.toLowerCase())));

		const selectedLabel = $.derived(() => value
			? items.find((item) => item.value === value)?.label
			: "Open Listbox");

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<main data-testid="main" class="flex flex-col gap-12">`);

			if (Select.Root) {
				$$renderer.push('<!--[-->');

				Select.Root($$renderer, $.spread_props([
					restProps,
					{
						type: 'single',
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},

						get open() {
							return open;
						},

						set open($$value) {
							open = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Select.Trigger) {
								$$renderer.push('<!--[-->');

								Select.Trigger($$renderer, {
									'data-testid': 'trigger',
									class: 'p-2',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(selectedLabel())}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Select.Portal) {
								$$renderer.push('<!--[-->');

								Select.Portal($$renderer, $.spread_props([
									portalProps,
									{
										children: ($$renderer) => {
											if (Select.Content) {
												$$renderer.push('<!--[-->');

												Select.Content($$renderer, $.spread_props([
													{ 'data-testid': 'content' },
													contentProps,
													{
														class: 'bg-white p-4',
														children: ($$renderer) => {
															if (Select.Group) {
																$$renderer.push('<!--[-->');

																Select.Group($$renderer, {
																	'data-testid': 'group',
																	children: ($$renderer) => {
																		if (Select.GroupHeading) {
																			$$renderer.push('<!--[-->');

																			Select.GroupHeading($$renderer, {
																				'data-testid': 'group-label',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Options`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` <!--[-->`);

																		const each_array = $.ensure_array_like(filteredItems());

																		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																			let { value, label, disabled } = each_array[$$index];
																			const testId = generateTestId(value);

																			{
																				function children($$renderer, { selected, highlighted: _highlighted }) {
																					if (selected) {
																						$$renderer.push(`<!--[0--><span${$.attr('data-testid', `${$.stringify(testId)}-indicator`)}>x</span>`);
																					} else {
																						$$renderer.push('<!--[-1-->');
																					}

																					$$renderer.push(`<!--]--> ${$.escape(label)}`);
																				}

																				if (Select.Item) {
																					$$renderer.push('<!--[-->');

																					Select.Item($$renderer, {
																						'data-testid': testId,
																						disabled,
																						value,
																						label,
																						class: 'p-2',
																						children,
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}
																			}
																		}

																		$$renderer.push(`<!--]-->`);
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
													}
												]));

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										},
										$$slots: { default: true }
									}
								]));

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <div data-testid="outside" style="bottom: 0px; right: 10px; position: absolute;">outside</div> <button data-testid="open-binding">${$.escape(open)}</button> <button data-testid="value-binding">`);

			if (value === "") {
				$$renderer.push(`<!--[0-->empty`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(value)}`);
			}

			$$renderer.push(`<!--]--></button></main> <div data-testid="portal-target" id="portal-target"></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}