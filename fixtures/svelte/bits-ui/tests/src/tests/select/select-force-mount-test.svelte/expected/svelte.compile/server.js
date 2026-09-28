import * as $ from 'svelte/internal/server';
import { Select } from "bits-ui";
import { generateTestId } from "../helpers/select";

export default function Select_force_mount_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			contentProps,
			portalProps,
			items,
			value = "",
			open = false,
			searchValue = "",
			withOpenCheck = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const filteredItems = $.derived(() => searchValue === ""
			? items
			: items.filter((item) => item.label.includes(searchValue.toLowerCase())));

		const selectedLabel = $.derived(() => filteredItems().find((item) => item.value === value)?.label);

		function Content($$renderer, { props, wrapperProps }) {
			$$renderer.push(`<div${$.attributes({ ...wrapperProps })}><div${$.attributes({ ...props })}>`);

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

			$$renderer.push(`</div></div>`);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<main data-testid="main">`);

			if (Select.Root) {
				$$renderer.push('<!--[-->');

				Select.Root($$renderer, $.spread_props([
					restProps,
					{
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
									children: ($$renderer) => {
										if (selectedLabel()) {
											$$renderer.push(`<!--[0-->${$.escape(selectedLabel())}`);
										} else {
											$$renderer.push(`<!--[-1-->Open combobox`);
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

							$$renderer.push(` `);

							if (Select.Portal) {
								$$renderer.push('<!--[-->');

								Select.Portal($$renderer, $.spread_props([
									portalProps,
									{
										children: ($$renderer) => {
											if (withOpenCheck) {
												$$renderer.push('<!--[0-->');

												{
													function child($$renderer, props) {
														if (props.open) {
															$$renderer.push('<!--[0-->');
															Content($$renderer, props);
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]-->`);
													}

													if (Select.Content) {
														$$renderer.push('<!--[-->');

														Select.Content($$renderer, $.spread_props([
															{ 'data-testid': 'content' },
															contentProps,
															{ forceMount: true, child, $$slots: { child: true } }
														]));

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}
											} else {
												$$renderer.push('<!--[-1-->');

												{
													function child($$renderer, props) {
														Content($$renderer, props);
													}

													if (Select.Content) {
														$$renderer.push('<!--[-->');

														Select.Content($$renderer, $.spread_props([
															{ 'data-testid': 'content' },
															contentProps,
															{ forceMount: true, child, $$slots: { child: true } }
														]));

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