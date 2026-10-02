import * as $ from 'svelte/internal/server';
import { mode } from "mode-watcher";
import "./raycast.css";
import { Command } from "bits-ui";
import { FigmaIcon, LinearIcon, RaycastIcon, SlackIcon, YouTubeIcon } from "../icons/index.js";
import Logo from "../logo.svelte";
import Item from "./item.svelte";
import { ClipboardIcon, HammerIcon, RaycastDarkIcon, RaycastLightIcon } from "./icons/index.js";
import SubCommand from "./sub-command.svelte";

export default function Raycast_command($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = "linear";
		let inputEl = null;
		let listEl = null;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="raycast">`);

			if (Command.Root) {
				$$renderer.push('<!--[-->');

				Command.Root($$renderer, {
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<div data-command-raycast-top-shine=""></div> `);

						if (Command.Input) {
							$$renderer.push('<!--[-->');

							Command.Input($$renderer, {
								autofocus: true,
								placeholder: 'Search for apps and commands...',
								get ref() {
									return inputEl;
								},

								set ref($$value) {
									inputEl = $$value;
									$$settled = false;
								}
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` <hr data-command-raycast-loader=""/> `);

						if (Command.List) {
							$$renderer.push('<!--[-->');

							Command.List($$renderer, {
								get ref() {
									return listEl;
								},

								set ref($$value) {
									listEl = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									if (Command.Viewport) {
										$$renderer.push('<!--[-->');

										Command.Viewport($$renderer, {
											children: ($$renderer) => {
												if (Command.Empty) {
													$$renderer.push('<!--[-->');

													Command.Empty($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->No results found.`);
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
															if (Command.GroupHeading) {
																$$renderer.push('<!--[-->');

																Command.GroupHeading($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Suggestions`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Command.GroupItems) {
																$$renderer.push('<!--[-->');

																Command.GroupItems($$renderer, {
																	children: ($$renderer) => {
																		Item($$renderer, {
																			value: 'linear',
																			keywords: ["issue", "sprint"],
																			children: ($$renderer) => {
																				Logo($$renderer, {
																					children: ($$renderer) => {
																						LinearIcon($$renderer, { style: 'width: 12px; height: 12px' });
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push(`<!----> Linear`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push(`<!----> `);

																		Item($$renderer, {
																			value: 'figma',
																			keywords: ["design", "ui", "ux"],
																			children: ($$renderer) => {
																				Logo($$renderer, {
																					children: ($$renderer) => {
																						FigmaIcon($$renderer, {});
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push(`<!----> Figma`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push(`<!----> `);

																		Item($$renderer, {
																			value: 'slack',
																			keywords: ["chat", "team", "communication"],
																			children: ($$renderer) => {
																				Logo($$renderer, {
																					children: ($$renderer) => {
																						SlackIcon($$renderer, {});
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push(`<!----> Slack`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push(`<!----> `);

																		Item($$renderer, {
																			value: 'youtube',
																			keywords: ["video", "watch", "stream"],
																			children: ($$renderer) => {
																				Logo($$renderer, {
																					children: ($$renderer) => {
																						YouTubeIcon($$renderer, {});
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push(`<!----> YouTube`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push(`<!----> `);

																		Item($$renderer, {
																			value: 'raycast',
																			keywords: ["productivity", "tools", "apps"],
																			children: ($$renderer) => {
																				Logo($$renderer, {
																					children: ($$renderer) => {
																						RaycastIcon($$renderer, {});
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push(`<!----> Raycast`);
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

												if (Command.Group) {
													$$renderer.push('<!--[-->');

													Command.Group($$renderer, {
														children: ($$renderer) => {
															if (Command.GroupHeading) {
																$$renderer.push('<!--[-->');

																Command.GroupHeading($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Commands`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Command.GroupItems) {
																$$renderer.push('<!--[-->');

																Command.GroupItems($$renderer, {
																	children: ($$renderer) => {
																		Item($$renderer, {
																			isCommand: true,
																			value: 'clipboard history',
																			keywords: ["copy", "paste", "clipboard"],
																			children: ($$renderer) => {
																				Logo($$renderer, {
																					children: ($$renderer) => {
																						ClipboardIcon($$renderer, {});
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push(`<!----> Clipboard History`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push(`<!----> `);

																		Item($$renderer, {
																			isCommand: true,
																			value: 'import extension',
																			keywords: ["import", "extension"],
																			children: ($$renderer) => {
																				Logo($$renderer, {
																					children: ($$renderer) => {
																						HammerIcon($$renderer, {});
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push(`<!----> Import Extension`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push(`<!----> `);

																		Item($$renderer, {
																			isCommand: true,
																			value: 'manage extensions',
																			keywords: ["manage", "extension"],
																			children: ($$renderer) => {
																				Logo($$renderer, {
																					children: ($$renderer) => {
																						HammerIcon($$renderer, {});
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push(`<!----> Manage Extensions`);
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

						$$renderer.push(` <div data-command-raycast-footer="">`);

						if (mode.current === "dark") {
							$$renderer.push('<!--[0-->');
							RaycastDarkIcon($$renderer, {});
						} else {
							$$renderer.push('<!--[-1-->');
							RaycastLightIcon($$renderer, {});
						}

						$$renderer.push(`<!--]--> <button data-command-raycast-open-trigger="">Open Application <kbd>↵</kbd></button> <hr/> `);
						SubCommand($$renderer, { listEl, inputEl, selectedValue: value });
						$$renderer.push(`<!----></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}