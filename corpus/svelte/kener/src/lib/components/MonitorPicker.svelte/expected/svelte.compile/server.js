import * as $ from 'svelte/internal/server';
import * as Command from "$lib/components/ui/command/index.js";
import * as Popover from "$lib/components/ui/popover/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import CheckIcon from "@lucide/svelte/icons/check";
import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
import ListPlusIcon from "@lucide/svelte/icons/list-plus";
import clientResolver from "$lib/client/resolver.js";
import { resolve } from "$app/paths";

export default function MonitorPicker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			monitors = [],
			selectedTags = [],
			onToggle,
			onAddMany,
			placeholder = "Search monitors to add..."
		} = $$props;

		let open = false;
		let search = "";

		// Own filtering (shouldFilter={false}) so "Add all matching" counts stay
		// consistent with what the list shows. Case-insensitive over name + tag.
		const filteredMonitors = $.derived(() => {
			const query = search.trim().toLowerCase();

			if (!query) return monitors;

			return monitors.filter((m) => m.name.toLowerCase().includes(query) || m.tag.toLowerCase().includes(query));
		});

		const unselectedMatches = $.derived(() => filteredMonitors().filter((m) => !selectedTags.includes(m.tag)));
		const showAddAll = $.derived(() => !!search.trim() && unselectedMatches().length > 0 && !!onAddMany);

		function addAllMatching() {
			onAddMany?.(unselectedMatches().map((m) => m.tag));
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
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
								Button($$renderer, $.spread_props([
									props,
									{
										variant: 'outline',
										role: 'combobox',
										'aria-expanded': open,
										class: 'w-full justify-between font-normal',
										children: ($$renderer) => {
											$$renderer.push(`<span class="text-muted-foreground">${$.escape(placeholder)}</span> `);
											ChevronsUpDownIcon($$renderer, { class: 'text-muted-foreground size-4 shrink-0' });
											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									}
								]));
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
								class: 'w-[var(--bits-popover-trigger-width)] p-0',
								align: 'start',
								children: ($$renderer) => {
									if (Command.Root) {
										$$renderer.push('<!--[-->');

										Command.Root($$renderer, {
											shouldFilter: false,
											children: ($$renderer) => {
												if (Command.Input) {
													$$renderer.push('<!--[-->');

													Command.Input($$renderer, {
														placeholder,
														get value() {
															return search;
														},

														set value($$value) {
															search = $$value;
															$$settled = false;
														}
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Command.List) {
													$$renderer.push('<!--[-->');

													Command.List($$renderer, {
														class: 'max-h-64',
														children: ($$renderer) => {
															if (Command.Empty) {
																$$renderer.push('<!--[-->');

																Command.Empty($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->No monitors found.`);
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
																	children: ($$renderer) => {
																		$$renderer.push(`<!--[-->`);

																		const each_array = $.ensure_array_like(filteredMonitors());

																		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																			let monitor = each_array[$$index];
																			const selected = selectedTags.includes(monitor.tag);

																			if (Command.Item) {
																				$$renderer.push('<!--[-->');

																				Command.Item($$renderer, {
																					value: monitor.tag,
																					onSelect: () => onToggle(monitor.tag),
																					children: ($$renderer) => {
																						CheckIcon($$renderer, { class: `size-4 ${selected ? 'opacity-100' : 'opacity-0'}` });
																						$$renderer.push(`<!----> `);

																						if (monitor.image) {
																							$$renderer.push(`<!--[0--><img${$.attr('src', clientResolver(resolve, monitor.image))}${$.attr('alt', monitor.name)} class="size-5 rounded object-cover"/>`);
																						} else {
																							$$renderer.push(`<!--[-1--><div class="bg-muted flex size-5 items-center justify-center rounded text-[10px] font-medium">${$.escape(monitor.name.charAt(0).toUpperCase())}</div>`);
																						}

																						$$renderer.push(`<!--]--> <span class="truncate">${$.escape(monitor.name)}</span> <span class="text-muted-foreground ml-auto truncate text-xs">${$.escape(monitor.tag)}</span>`);
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

															$$renderer.push(` `);

															if (showAddAll()) {
																$$renderer.push('<!--[0-->');

																if (Command.Separator) {
																	$$renderer.push('<!--[-->');
																	Command.Separator($$renderer, {});
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Command.Group) {
																	$$renderer.push('<!--[-->');

																	Command.Group($$renderer, {
																		children: ($$renderer) => {
																			if (Command.Item) {
																				$$renderer.push('<!--[-->');

																				Command.Item($$renderer, {
																					value: '__add-all-matching__',
																					onSelect: addAllMatching,
																					children: ($$renderer) => {
																						ListPlusIcon($$renderer, { class: 'size-4' });
																						$$renderer.push(`<!----> Add all ${$.escape(unselectedMatches().length)} matching`);
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
															} else {
																$$renderer.push('<!--[-1-->');
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}