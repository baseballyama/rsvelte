import * as $ from 'svelte/internal/server';
import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { labels } from "../data/data.js";
import { taskSchema } from "../data/schemas.js";

export default function Data_table_row_actions($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { row } = $$props;
		const task = $.derived(() => taskSchema.parse(row.original));

		if (DropdownMenu.Root) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Root($$renderer, {
				children: ($$renderer) => {
					{
						function child($$renderer, { props }) {
							Button($$renderer, $.spread_props([
								props,
								{
									variant: 'ghost',
									class: 'flex h-8 w-8 p-0 data-[state=open]:bg-muted',
									children: ($$renderer) => {
										EllipsisIcon($$renderer, {});
										$$renderer.push(`<!----> <span class="sr-only">Open Menu</span>`);
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
							class: 'w-[160px]',
							align: 'end',
							children: ($$renderer) => {
								if (DropdownMenu.Item) {
									$$renderer.push('<!--[-->');

									DropdownMenu.Item($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Edit`);
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
										children: ($$renderer) => {
											$$renderer.push(`<!---->Make a copy`);
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
										children: ($$renderer) => {
											$$renderer.push(`<!---->Favorite`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (DropdownMenu.Separator) {
									$$renderer.push('<!--[-->');
									DropdownMenu.Separator($$renderer, {});
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
													children: ($$renderer) => {
														$$renderer.push(`<!---->Labels`);
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
													children: ($$renderer) => {
														if (DropdownMenu.RadioGroup) {
															$$renderer.push('<!--[-->');

															DropdownMenu.RadioGroup($$renderer, {
																value: task().label,
																children: ($$renderer) => {
																	$$renderer.push(`<!--[-->`);

																	const each_array = $.ensure_array_like(labels);

																	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																		let label = each_array[$$index];

																		if (DropdownMenu.RadioItem) {
																			$$renderer.push('<!--[-->');

																			DropdownMenu.RadioItem($$renderer, {
																				value: label.value,
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(label.label)}`);
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

								$$renderer.push(` `);

								if (DropdownMenu.Separator) {
									$$renderer.push('<!--[-->');
									DropdownMenu.Separator($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (DropdownMenu.Item) {
									$$renderer.push('<!--[-->');

									DropdownMenu.Item($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Delete `);

											if (DropdownMenu.Shortcut) {
												$$renderer.push('<!--[-->');

												DropdownMenu.Shortcut($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->⌘⌫`);
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
	});
}