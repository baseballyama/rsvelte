import * as $ from 'svelte/internal/server';
import { DropdownMenu } from "bits-ui";

export default function Dropdown_menu_force_mount_test($$renderer, $$props) {
	let {
		checked = false,
		subChecked = false,
		radio = "",
		subRadio = "",
		open = false,
		contentProps = {},
		portalProps = {},
		withOpenCheck = false,
		$$slots,
		$$events,
		...restProps
	} = $$props;

	function Content($$renderer, { props, wrapperProps }) {
		$$renderer.push(`<div${$.attributes({ ...wrapperProps })}><div${$.attributes({ ...props })}>`);

		if (DropdownMenu.Separator) {
			$$renderer.push('<!--[-->');
			DropdownMenu.Separator($$renderer, { 'data-testid': 'separator' });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (DropdownMenu.Group) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Group($$renderer, {
				'data-testid': 'group',
				children: ($$renderer) => {
					if (DropdownMenu.GroupHeading) {
						$$renderer.push('<!--[-->');

						DropdownMenu.GroupHeading($$renderer, {
							'data-testid': 'group-heading',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Stuff`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (DropdownMenu.Item) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Item($$renderer, {
							'data-testid': 'item',
							children: ($$renderer) => {
								$$renderer.push(`<span>item</span>`);
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

		if (DropdownMenu.Sub) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Sub($$renderer, {
				children: ($$renderer) => {
					if (DropdownMenu.SubTrigger) {
						$$renderer.push('<!--[-->');

						DropdownMenu.SubTrigger($$renderer, {
							'data-testid': 'sub-trigger',
							children: ($$renderer) => {
								$$renderer.push(`<span>subtrigger</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (DropdownMenu.SubContent) {
						$$renderer.push('<!--[-->');

						DropdownMenu.SubContent($$renderer, {
							'data-testid': 'sub-content',
							children: ($$renderer) => {
								if (DropdownMenu.Item) {
									$$renderer.push('<!--[-->');

									DropdownMenu.Item($$renderer, {
										'data-testid': 'sub-item',
										children: ($$renderer) => {
											$$renderer.push(`<span>Email</span>`);
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
									function children($$renderer, { checked, indeterminate: _indeterminate }) {
										$$renderer.push(`<span data-testid="sub-checkbox-indicator">${$.escape(checked)}</span> sub checkbox`);
									}

									if (DropdownMenu.CheckboxItem) {
										$$renderer.push('<!--[-->');

										DropdownMenu.CheckboxItem($$renderer, {
											'data-testid': 'sub-checkbox-item',
											get checked() {
												return subChecked;
											},

											set checked($$value) {
												subChecked = $$value;
												$$settled = false;
											},
											children,
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}
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

		if (DropdownMenu.Item) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Item($$renderer, {
				disabled: true,
				'data-testid': 'disabled-item',
				children: ($$renderer) => {
					$$renderer.push(`<!---->disabled item`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (DropdownMenu.Item) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Item($$renderer, {
				disabled: true,
				'data-testid': 'disabled-item-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->disabled item 2`);
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
			function children($$renderer, { checked, indeterminate: _indeterminate }) {
				$$renderer.push(`<span data-testid="checkbox-indicator">${$.escape(checked)}</span> Checkbox Item`);
			}

			if (DropdownMenu.CheckboxItem) {
				$$renderer.push('<!--[-->');

				DropdownMenu.CheckboxItem($$renderer, {
					'data-testid': 'checkbox-item',
					get checked() {
						return checked;
					},

					set checked($$value) {
						checked = $$value;
						$$settled = false;
					},
					children,
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(` `);

		if (DropdownMenu.Item) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Item($$renderer, {
				'data-testid': 'item-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->item 2`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (DropdownMenu.RadioGroup) {
			$$renderer.push('<!--[-->');

			DropdownMenu.RadioGroup($$renderer, {
				'data-testid': 'radio-group',
				get value() {
					return radio;
				},

				set value($$value) {
					radio = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					{
						function children($$renderer, { checked }) {
							$$renderer.push(`<span data-testid="radio-indicator-1">${$.escape(checked)}</span> <span>Radio Item 1</span>`);
						}

						if (DropdownMenu.RadioItem) {
							$$renderer.push('<!--[-->');

							DropdownMenu.RadioItem($$renderer, {
								value: '1',
								'data-testid': 'radio-item',
								children,
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(` `);

					{
						function children($$renderer, { checked }) {
							$$renderer.push(`<span data-testid="radio-indicator-2">${$.escape(checked)}</span> <span>Radio Item 2</span>`);
						}

						if (DropdownMenu.RadioItem) {
							$$renderer.push('<!--[-->');

							DropdownMenu.RadioItem($$renderer, {
								value: '2',
								'data-testid': 'radio-item-2',
								children,
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}
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
		$$renderer.push(`<main><div data-testid="outside" style="bottom: 0px; right: 10px; position: absolute;">outside</div> <button data-testid="previous-button">previous button</button> <div data-testid="non-portal-container">`);

		if (DropdownMenu.Root) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Root($$renderer, $.spread_props([
				restProps,
				{
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (DropdownMenu.Trigger) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Trigger($$renderer, {
								'data-testid': 'trigger',
								class: 'h-[500px] w-[500px]',
								'aria-expanded': undefined,
								'aria-controls': undefined,
								children: ($$renderer) => {
									$$renderer.push(`<!---->open`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (DropdownMenu.Portal) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Portal($$renderer, $.spread_props([
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

												if (DropdownMenu.Content) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Content($$renderer, $.spread_props([
														contentProps,
														{
															'data-testid': 'content',
															forceMount: true,
															child,
															$$slots: { child: true }
														}
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

												if (DropdownMenu.Content) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Content($$renderer, $.spread_props([
														contentProps,
														{
															'data-testid': 'content',
															forceMount: true,
															child,
															$$slots: { child: true }
														}
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

		$$renderer.push(`</div> <button data-testid="next-button">next button</button> <button data-testid="binding">${$.escape(open)}</button> <button data-testid="checked-binding">${$.escape(checked)}</button> <button data-testid="sub-checked-binding">${$.escape(subChecked)}</button> <button aria-label="radio-main" data-testid="radio-binding">${$.escape(radio)}</button> <button aria-label="radio-sub" data-testid="sub-radio-binding">${$.escape(subRadio)}</button> <div id="portal-target" data-testid="portal-target"></div></main>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}