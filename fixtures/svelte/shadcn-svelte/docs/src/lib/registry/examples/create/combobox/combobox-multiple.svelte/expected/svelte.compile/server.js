import * as $ from 'svelte/internal/server';
import * as Command from "$lib/registry/ui/command/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { cn } from "$lib/utils.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Combobox_multiple($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const frameworks = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"];
		let open = false;
		let values = [frameworks[0]];

		function toggleValue(framework) {
			values = values.includes(framework)
				? values.filter((v) => v !== framework)
				: [...values, framework];
		}

		function removeValue(e, framework) {
			e.stopPropagation();
			values = values.filter((v) => v !== framework);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'Combobox Multiple',
				children: ($$renderer) => {
					if (Popover.Root) {
						$$renderer.push('<!--[-->');

						Popover.Root($$renderer, {
							get open() {
								return open;
							},

							set open($$value) {
								open = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								{
									function child($$renderer, { props }) {
										$$renderer.push(`<div${$.attributes({
											...props,
											role: 'combobox',
											'aria-expanded': open,
											class: 'flex min-h-9 w-64 cursor-pointer flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm shadow-xs transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
										})}><!--[-->`);

										const each_array = $.ensure_array_like(values);

										for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
											let framework = each_array[$$index];

											Badge($$renderer, {
												variant: 'secondary',
												class: 'gap-1 pr-0.5',
												onclick: (e) => removeValue(e, framework),
												onkeydown: (e) => e.key === "Enter" && removeValue(e, framework),
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(framework)} `);

													IconPlaceholder($$renderer, {
														lucide: 'XIcon',
														tabler: 'IconX',
														hugeicons: 'Cancel01Icon',
														phosphor: 'XIcon',
														remixicon: 'RiCloseLine',
														class: 'size-3'
													});

													$$renderer.push(`<!---->`);
												},
												$$slots: { default: true }
											});
										}

										$$renderer.push(`<!--]--> <span class="flex-1 py-1 text-sm text-muted-foreground">Select frameworks...</span></div>`);
									}

									if (Popover.Trigger) {
										$$renderer.push('<!--[-->');
										Popover.Trigger($$renderer, { child, $$slots: { child: true } });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}

								$$renderer.push(` `);

								if (Popover.Content) {
									$$renderer.push('<!--[-->');

									Popover.Content($$renderer, {
										class: 'w-64 p-0',
										align: 'start',
										children: ($$renderer) => {
											if (Command.Root) {
												$$renderer.push('<!--[-->');

												Command.Root($$renderer, {
													children: ($$renderer) => {
														if (Command.Input) {
															$$renderer.push('<!--[-->');
															Command.Input($$renderer, { placeholder: 'Search framework...' });
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Command.List) {
															$$renderer.push('<!--[-->');

															Command.List($$renderer, {
																children: ($$renderer) => {
																	if (Command.Empty) {
																		$$renderer.push('<!--[-->');

																		Command.Empty($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->No items found.`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Command.Group) {
																		$$renderer.push('<!--[-->');

																		Command.Group($$renderer, {
																			value: 'frameworks',
																			children: ($$renderer) => {
																				$$renderer.push(`<!--[-->`);

																				const each_array_1 = $.ensure_array_like(frameworks);

																				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																					let framework = each_array_1[$$index_1];

																					if (Command.Item) {
																						$$renderer.push('<!--[-->');

																						Command.Item($$renderer, {
																							value: framework,
																							onSelect: () => toggleValue(framework),
																							children: ($$renderer) => {
																								IconPlaceholder($$renderer, {
																									lucide: 'CheckIcon',
																									tabler: 'IconCheck',
																									hugeicons: 'Tick02Icon',
																									phosphor: 'CheckIcon',
																									remixicon: 'RiCheckLine',
																									class: cn(!values.includes(framework) && "text-transparent")
																								});

																								$$renderer.push(`<!----> ${$.escape(framework)}`);
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
	});
}