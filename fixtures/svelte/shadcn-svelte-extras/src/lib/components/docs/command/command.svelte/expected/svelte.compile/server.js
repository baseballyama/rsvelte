import * as $ from 'svelte/internal/server';
import * as Dialog from '$lib/components/ui/dialog';
import * as Command from '$lib/components/ui/command';
import { goto } from '$app/navigation';
import { commandContext } from '$lib/context';
import { groupedDocs } from '$lib/features/docs/docs';

export default function Command_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const commandState = commandContext.get();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return commandState.current;
					},

					set open($$value) {
						commandState.current = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'top-[35%] p-0',
								showCloseButton: false,
								children: ($$renderer) => {
									if (Command.Root) {
										$$renderer.push('<!--[-->');

										Command.Root($$renderer, {
											children: ($$renderer) => {
												if (Command.Input) {
													$$renderer.push('<!--[-->');
													Command.Input($$renderer, { placeholder: 'Search for extras...' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Command.List) {
													$$renderer.push('<!--[-->');

													Command.List($$renderer, {
														class: 'min-h-[300px]',
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

															$$renderer.push(` <!--[-->`);

															const each_array = $.ensure_array_like(Object.entries(groupedDocs));

															for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
																let [group, routes] = each_array[$$index_1];

																if (Command.Group) {
																	$$renderer.push('<!--[-->');

																	Command.Group($$renderer, {
																		heading: group,
																		children: ($$renderer) => {
																			$$renderer.push(`<!--[-->`);

																			const each_array_1 = $.ensure_array_like(routes);

																			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																				let route = each_array_1[$$index];

																				if (Command.Item) {
																					$$renderer.push('<!--[-->');

																					Command.Item($$renderer, {
																						onclick: async () => {
																							await goto(route.href);
																							commandState.setFalse();
																						},

																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(route.title)}`);
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