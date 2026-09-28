import * as $ from 'svelte/internal/server';
import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
import { useId } from "bits-ui";
import { tick } from "svelte";
import * as Command from "$lib/registry/ui/command/index.js";
import * as HoverCard from "$lib/registry/ui/hover-card/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import ModelItem from "./model-item.svelte";

export default function Model_selector($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { types, models } = $$props;
		let selectedModel = $.derived(() => models[0]);
		let peekedModel = void 0;
		let open = false;
		let value = "";
		const selectedValue = $.derived(() => models.find((f) => f.id === value)?.name ?? "Select a model...");

		// We want to refocus the trigger button when the user selects
		// an item from the list so users can continue navigating the
		// rest of the form with the keyboard.
		function closeAndFocusTrigger(triggerId) {
			open = false;

			tick().then(() => {
				document.getElementById(triggerId)?.focus();
			});
		}

		function onPopoverOpenChange(open) {
			if (open) {
				peekedModel = selectedModel();
			} else {
				peekedModel = undefined;
			}
		}

		const hoverCardIsOpen = $.derived(() => open && peekedModel !== undefined);
		let triggerId = useId();

		function handlePeek(model) {
			if (peekedModel === undefined) {
				if (!open) return;

				peekedModel = model;

				return;
			}

			peekedModel = model;
		}

		function onPopoverOutsideClick() {
			peekedModel = undefined;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid gap-2">`);

			if (HoverCard.Root) {
				$$renderer.push('<!--[-->');

				HoverCard.Root($$renderer, {
					openDelay: 200,
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								$$renderer.push(`<div${$.attributes({ ...props })}>`);

								Label($$renderer, {
									for: 'model',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Model`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div>`);
							}

							if (HoverCard.Trigger) {
								$$renderer.push('<!--[-->');
								HoverCard.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (HoverCard.Content) {
							$$renderer.push('<!--[-->');

							HoverCard.Content($$renderer, {
								class: 'w-[260px] text-sm',
								align: 'start',
								side: 'left',
								children: ($$renderer) => {
									$$renderer.push(`<!---->The model which will generate the completion. Some models are suitable for natural language
			tasks, others specialize in code. Learn more.`);
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

			if (Popover.Root) {
				$$renderer.push('<!--[-->');

				Popover.Root($$renderer, {
					onOpenChange: onPopoverOpenChange,
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Popover.Trigger) {
							$$renderer.push('<!--[-->');

							Popover.Trigger($$renderer, {
								class: buttonVariants({ variant: "outline", class: "w-[200px] justify-between" }),
								role: 'combobox',
								'aria-expanded': open,
								id: triggerId,
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(selectedValue())} `);
									ChevronsUpDownIcon($$renderer, { class: 'opacity-50' });
									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Popover.Content) {
							$$renderer.push('<!--[-->');

							Popover.Content($$renderer, {
								class: 'w-[250px] p-0',
								onInteractOutside: onPopoverOutsideClick,
								children: ($$renderer) => {
									if (HoverCard.Root) {
										$$renderer.push('<!--[-->');

										HoverCard.Root($$renderer, {
											open: hoverCardIsOpen(),
											openDelay: 0,
											children: ($$renderer) => {
												if (HoverCard.Content) {
													$$renderer.push('<!--[-->');

													HoverCard.Content($$renderer, {
														interactOutsideBehavior: 'ignore',
														class: '-ms-2 min-h-[280px]',
														side: 'left',
														align: 'start',
														children: ($$renderer) => {
															if (peekedModel && hoverCardIsOpen()) {
																$$renderer.push(`<!--[0--><div class="grid gap-2"><h4 class="leading-none font-medium">${$.escape(peekedModel.name)}</h4> <div class="text-sm text-muted-foreground">${$.escape(peekedModel.description)}</div> `);

																if (peekedModel.strengths) {
																	$$renderer.push(`<!--[0--><div class="mt-4 grid gap-2"><h5 class="text-sm leading-none font-medium">Strengths</h5> <ul class="text-sm text-muted-foreground">${$.escape(peekedModel.strengths)}</ul></div>`);
																} else {
																	$$renderer.push('<!--[-1-->');
																}

																$$renderer.push(`<!--]--></div>`);
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

												$$renderer.push(` `);

												if (Command.Root) {
													$$renderer.push('<!--[-->');

													Command.Root($$renderer, {
														loop: true,
														children: ($$renderer) => {
															if (Command.Input) {
																$$renderer.push('<!--[-->');
																Command.Input($$renderer, { placeholder: 'Search Models....' });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Command.List) {
																$$renderer.push('<!--[-->');

																Command.List($$renderer, {
																	class: 'h-(--bits-command-list-height) max-h-[400px]',
																	children: ($$renderer) => {
																		if (Command.Empty) {
																			$$renderer.push('<!--[-->');

																			Command.Empty($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->No models found.`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` <!--[-->`);

																		const each_array = $.ensure_array_like(types);

																		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
																			let type = each_array[$$index_1];

																			if (Command.Group) {
																				$$renderer.push('<!--[-->');

																				Command.Group($$renderer, {
																					heading: type,
																					children: ($$renderer) => {
																						$$renderer.push(`<!--[-->`);

																						const each_array_1 = $.ensure_array_like(models.filter((model) => model.type === type));

																						for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																							let model = each_array_1[$$index];

																							{
																								function child($$renderer, { props }) {
																									$$renderer.push(`<div${$.attributes({ ...props, role: 'button', tabindex: 0 })}>`);

																									ModelItem($$renderer, {
																										model,
																										onSelect: () => {
																											value = model.id;
																											closeAndFocusTrigger(triggerId);
																										},

																										onPeek: () => {
																											handlePeek(model);
																										},
																										isSelected: value === model.id
																									});

																									$$renderer.push(`<!----></div>`);
																								}

																								if (HoverCard.Trigger) {
																									$$renderer.push('<!--[-->');
																									HoverCard.Trigger($$renderer, { child, $$slots: { child: true } });
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