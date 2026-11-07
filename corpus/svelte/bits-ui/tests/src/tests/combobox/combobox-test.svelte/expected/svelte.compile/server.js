import * as $ from 'svelte/internal/server';
import "../../app.css";
import { Combobox } from "bits-ui";

export default function Combobox_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			contentProps,
			portalProps,
			items = [],
			value = "",
			open = false,
			searchValue = "",
			inputProps,
			onOpenChange,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const filteredItems = $.derived(() => searchValue === ""
			? items
			: items.filter((item) => item.label.includes(searchValue.toLowerCase())));

		const inputValue = $.derived(() => {
			return items.find((item) => item.value === value)?.label;
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<main data-testid="main" class="flex flex-col gap-12">`);

			if (Combobox.Root) {
				$$renderer.push('<!--[-->');

				Combobox.Root($$renderer, $.spread_props([
					{ type: 'single', inputValue: inputValue() },
					restProps,
					{
						onOpenChange: (v) => {
							onOpenChange?.(v);

							if (!v) searchValue = "";
						},

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
							if (Combobox.Trigger) {
								$$renderer.push('<!--[-->');

								Combobox.Trigger($$renderer, {
									'data-testid': 'trigger',
									class: 'p-4',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Open combobox`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Combobox.Input) {
								$$renderer.push('<!--[-->');

								Combobox.Input($$renderer, $.spread_props([
									{
										'data-testid': 'input',
										'aria-label': 'open combobox',
										oninput: (e) => searchValue = e.currentTarget.value
									},
									inputProps
								]));

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Combobox.Portal) {
								$$renderer.push('<!--[-->');

								Combobox.Portal($$renderer, $.spread_props([
									portalProps,
									{
										children: ($$renderer) => {
											if (Combobox.Content) {
												$$renderer.push('<!--[-->');

												Combobox.Content($$renderer, $.spread_props([
													{ 'data-testid': 'content' },
													contentProps,
													{
														children: ($$renderer) => {
															if (Combobox.Group) {
																$$renderer.push('<!--[-->');

																Combobox.Group($$renderer, {
																	'data-testid': 'group',
																	children: ($$renderer) => {
																		if (Combobox.GroupHeading) {
																			$$renderer.push('<!--[-->');

																			Combobox.GroupHeading($$renderer, {
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

																		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
																			let { value, label, disabled } = each_array[i];

																			{
																				function children($$renderer, { selected, highlighted: _highlighted }) {
																					if (selected) {
																						$$renderer.push(`<!--[0--><span${$.attr('data-testid', `${$.stringify(value)}-indicator`)}>x</span>`);
																					} else {
																						$$renderer.push('<!--[-1-->');
																					}

																					$$renderer.push(`<!--]--> ${$.escape(label)}`);
																				}

																				if (Combobox.Item) {
																					$$renderer.push('<!--[-->');

																					Combobox.Item($$renderer, {
																						'data-testid': value,
																						disabled,
																						value,
																						label,
																						class: 'data-highlighted:bg-red-500 data-highlighted:text-white data-selected:bg-blue-500 data-selected:text-white p-2',
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

			$$renderer.push(` <div data-testid="outside" style="bottom: 0px; right: 10px; position: absolute;">outside</div> <button data-testid="input-binding">`);

			if (searchValue === "") {
				$$renderer.push(`<!--[0-->empty`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(searchValue)}`);
			}

			$$renderer.push(`<!--]--></button> <button data-testid="open-binding">${$.escape(open)}</button> <button data-testid="value-binding">`);

			if (value === "") {
				$$renderer.push(`<!--[0-->empty`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(value)}`);
			}

			$$renderer.push(`<!--]--></button> <button data-testid="value-binding-3">set 3</button></main> <div data-testid="portal-target" id="portal-target"></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}