import * as $ from 'svelte/internal/server';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Dropdown_menu_with_radio($$renderer) {
	let position = "bottom";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'With Radio Group',
			children: ($$renderer) => {
				if (DropdownMenu.Root) {
					$$renderer.push('<!--[-->');

					DropdownMenu.Root($$renderer, {
						children: ($$renderer) => {
							{
								function child($$renderer, { props }) {
									Button($$renderer, $.spread_props([
										{ variant: 'outline', class: 'w-fit' },
										props,
										{
											children: ($$renderer) => {
												$$renderer.push(`<!---->Radio Group`);
											},
											$$slots: { default: true }
										}
									]));
								}

								if (DropdownMenu.Trigger) {
									$$renderer.push('<!--[-->');
									DropdownMenu.Trigger($$renderer, { child, $$slots: { child: true } });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(` `);

							if (DropdownMenu.Content) {
								$$renderer.push('<!--[-->');

								DropdownMenu.Content($$renderer, {
									children: ($$renderer) => {
										if (DropdownMenu.Group) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Group($$renderer, {
												children: ($$renderer) => {
													if (DropdownMenu.Label) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Label($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Panel Position`);
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
															get value() {
																return position;
															},

															set value($$value) {
																position = $$value;
																$$settled = false;
															},

															children: ($$renderer) => {
																if (DropdownMenu.RadioItem) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.RadioItem($$renderer, {
																		value: 'top',
																		children: ($$renderer) => {
																			IconPlaceholder($$renderer, {
																				lucide: 'ArrowUpIcon',
																				tabler: 'IconArrowUp',
																				hugeicons: 'ArrowUp01Icon',
																				phosphor: 'ArrowUpIcon',
																				remixicon: 'RiArrowUpLine'
																			});

																			$$renderer.push(`<!----> Top`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (DropdownMenu.RadioItem) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.RadioItem($$renderer, {
																		value: 'bottom',
																		children: ($$renderer) => {
																			IconPlaceholder($$renderer, {
																				lucide: 'ArrowDownIcon',
																				tabler: 'IconArrowDown',
																				hugeicons: 'ArrowDown01Icon',
																				phosphor: 'ArrowDownIcon',
																				remixicon: 'RiArrowDownLine'
																			});

																			$$renderer.push(`<!----> Bottom`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (DropdownMenu.RadioItem) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.RadioItem($$renderer, {
																		value: 'right',
																		disabled: true,
																		children: ($$renderer) => {
																			IconPlaceholder($$renderer, {
																				lucide: 'ArrowRightIcon',
																				tabler: 'IconArrowRight',
																				hugeicons: 'ArrowRight01Icon',
																				phosphor: 'ArrowRightIcon',
																				remixicon: 'RiArrowRightLine'
																			});

																			$$renderer.push(`<!----> Right`);
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
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}