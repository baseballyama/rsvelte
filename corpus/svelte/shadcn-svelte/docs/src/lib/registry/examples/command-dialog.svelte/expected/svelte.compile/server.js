import * as $ from 'svelte/internal/server';
import CalculatorIcon from "@lucide/svelte/icons/calculator";
import CalendarIcon from "@lucide/svelte/icons/calendar";
import CreditCardIcon from "@lucide/svelte/icons/credit-card";
import SettingsIcon from "@lucide/svelte/icons/settings";
import SmileIcon from "@lucide/svelte/icons/smile";
import UserIcon from "@lucide/svelte/icons/user";
import * as Command from "$lib/registry/ui/command/index.js";

export default function Command_dialog($$renderer) {
	let open = false;

	function handleKeydown(e) {
		if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			open = !open;
		}
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<p class="text-sm text-muted-foreground">Press <kbd class="pointer-events-none inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 select-none"><span class="text-xs">⌘</span>J</kbd></p> `);

		if (Command.Dialog) {
			$$renderer.push('<!--[-->');

			Command.Dialog($$renderer, {
				get open() {
					return open;
				},

				set open($$value) {
					open = $$value;
					$$settled = false;
				},

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
														CalendarIcon($$renderer, { class: 'me-2 size-4' });
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
														SmileIcon($$renderer, { class: 'me-2 size-4' });
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
													children: ($$renderer) => {
														CalculatorIcon($$renderer, { class: 'me-2 size-4' });
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
														UserIcon($$renderer, { class: 'me-2 size-4' });
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
														CreditCardIcon($$renderer, { class: 'me-2 size-4' });
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
														SettingsIcon($$renderer, { class: 'me-2 size-4' });
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

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}