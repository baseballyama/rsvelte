import * as $ from 'svelte/internal/server';
import { Combobox } from "bits-ui";

export default function Combobox_multi_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			contentProps,
			portalProps,
			items,
			value = [],
			open = false,
			searchValue = "",
			inputProps,
			onOpenChange,
			onFormSubmit,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const filteredItems = $.derived(() => searchValue === ""
			? items
			: items.filter((item) => item.label.includes(searchValue.toLowerCase())));

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<main data-testid="main" class="flex flex-col gap-12"><form data-testid="form" method="POST">`);

			if (Combobox.Root) {
				$$renderer.push('<!--[-->');

				Combobox.Root($$renderer, $.spread_props([
					{ type: 'multiple' },
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

																		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																			let { value, label, disabled } = each_array[$$index];

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

			$$renderer.push(` <div data-testid="outside" style="bottom: 0px; right: 10px; position: absolute;">outside</div> <button type="button" data-testid="input-binding">`);

			if (searchValue === "") {
				$$renderer.push(`<!--[0-->empty`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(searchValue)}`);
			}

			$$renderer.push(`<!--]--></button> <button type="button" data-testid="open-binding">${$.escape(open)}</button> <button type="button" data-testid="value-binding">`);

			if (value.length === 0) {
				$$renderer.push(`<!--[0-->empty`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(value)}`);
			}

			$$renderer.push(`<!--]--></button> <button data-testid="submit" type="submit">Submit</button></form></main> <div data-testid="portal-target" id="portal-target"></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}