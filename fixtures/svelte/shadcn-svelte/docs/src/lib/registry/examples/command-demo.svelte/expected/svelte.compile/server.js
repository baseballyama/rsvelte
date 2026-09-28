import * as $ from 'svelte/internal/server';
import CalculatorIcon from "@lucide/svelte/icons/calculator";
import CalendarIcon from "@lucide/svelte/icons/calendar";
import CreditCardIcon from "@lucide/svelte/icons/credit-card";
import SettingsIcon from "@lucide/svelte/icons/settings";
import SmileIcon from "@lucide/svelte/icons/smile";
import UserIcon from "@lucide/svelte/icons/user";
import * as Command from "$lib/registry/ui/command/index.js";

export default function Command_demo($$renderer) {
	if (Command.Root) {
		$$renderer.push('<!--[-->');

		Command.Root($$renderer, {
			class: 'rounded-lg border shadow-md md:min-w-[450px]',
			children: ($$renderer) => {
				if (Command.Input) {
					$$renderer.push('<!--[-->');
					Command.Input($$renderer, { placeholder: 'Type a command or search...' });
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
									heading: 'Suggestions',
									children: ($$renderer) => {
										if (Command.Item) {
											$$renderer.push('<!--[-->');

											Command.Item($$renderer, {
												children: ($$renderer) => {
													CalendarIcon($$renderer, {});
													$$renderer.push(`<!----> <span>Calendar</span>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Command.Item) {
											$$renderer.push('<!--[-->');

											Command.Item($$renderer, {
												children: ($$renderer) => {
													SmileIcon($$renderer, {});
													$$renderer.push(`<!----> <span>Search Emoji</span>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Command.Item) {
											$$renderer.push('<!--[-->');

											Command.Item($$renderer, {
												disabled: true,
												children: ($$renderer) => {
													CalculatorIcon($$renderer, {});
													$$renderer.push(`<!----> <span>Calculator</span>`);
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
									heading: 'Settings',
									children: ($$renderer) => {
										if (Command.Item) {
											$$renderer.push('<!--[-->');

											Command.Item($$renderer, {
												children: ($$renderer) => {
													UserIcon($$renderer, {});
													$$renderer.push(`<!----> <span>Profile</span> `);

													if (Command.Shortcut) {
														$$renderer.push('<!--[-->');

														Command.Shortcut($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->⌘P`);
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

										if (Command.Item) {
											$$renderer.push('<!--[-->');

											Command.Item($$renderer, {
												children: ($$renderer) => {
													CreditCardIcon($$renderer, {});
													$$renderer.push(`<!----> <span>Billing</span> `);

													if (Command.Shortcut) {
														$$renderer.push('<!--[-->');

														Command.Shortcut($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->⌘B`);
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

										if (Command.Item) {
											$$renderer.push('<!--[-->');

											Command.Item($$renderer, {
												children: ($$renderer) => {
													SettingsIcon($$renderer, {});
													$$renderer.push(`<!----> <span>Settings</span> `);

													if (Command.Shortcut) {
														$$renderer.push('<!--[-->');

														Command.Shortcut($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->⌘S`);
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
}