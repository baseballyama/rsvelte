import * as $ from 'svelte/internal/server';
import { Command, Popover } from "bits-ui";
import SubItem from "./sub-item.svelte";
import { FinderIcon, StarIcon, WindowIcon } from "./icons/index.js";

export default function Sub_command($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { listEl, inputEl, selectedValue = void 0 } = $$props;
		let open = false;

		function handleKeydown(e) {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				open = true;
			}
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
								$$renderer.push(`<button${$.attributes({
									...props,
									'data-command-raycast-subcommand-trigger': '',
									'aria-expanded': open
								})}>Actions <kbd>⌘</kbd> <kbd>K</kbd></button>`);
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

						if (Popover.Portal) {
							$$renderer.push('<!--[-->');

							Popover.Portal($$renderer, {
								children: ($$renderer) => {
									if (Popover.Content) {
										$$renderer.push('<!--[-->');

										Popover.Content($$renderer, {
											onCloseAutoFocus: (e) => {
												e.preventDefault();
												inputEl?.focus();
											},
											preventScroll: true,
											class: 'raycast-submenu',
											side: 'top',
											align: 'end',
											children: ($$renderer) => {
												if (Command.Root) {
													$$renderer.push('<!--[-->');

													Command.Root($$renderer, {
														children: ($$renderer) => {
															if (Command.List) {
																$$renderer.push('<!--[-->');

																Command.List($$renderer, {
																	children: ($$renderer) => {
																		if (Command.Group) {
																			$$renderer.push('<!--[-->');

																			Command.Group($$renderer, {
																				children: ($$renderer) => {
																					if (Command.GroupHeading) {
																						$$renderer.push('<!--[-->');

																						Command.GroupHeading($$renderer, {
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->${$.escape(selectedValue)}`);
																							},
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}

																					$$renderer.push(` `);

																					SubItem($$renderer, {
																						shortcut: '↵',
																						children: ($$renderer) => {
																							WindowIcon($$renderer, {});
																							$$renderer.push(`<!----> Open Application`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push(`<!----> `);

																					SubItem($$renderer, {
																						shortcut: '⌘ ↵',
																						children: ($$renderer) => {
																							FinderIcon($$renderer, {});
																							$$renderer.push(`<!----> Show in Finder`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push(`<!----> `);

																					SubItem($$renderer, {
																						shortcut: '⌘ I',
																						children: ($$renderer) => {
																							FinderIcon($$renderer, {});
																							$$renderer.push(`<!----> Show Info in Finder`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push(`<!----> `);

																					SubItem($$renderer, {
																						shortcut: '⌘ ⇧ F',
																						children: ($$renderer) => {
																							StarIcon($$renderer, {});
																							$$renderer.push(`<!----> Add to Favorites`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push(`<!---->`);
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

															if (Command.Input) {
																$$renderer.push('<!--[-->');
																Command.Input($$renderer, { placeholder: 'Search for actions...' });
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { selectedValue });
	});
}