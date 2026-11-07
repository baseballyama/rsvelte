import * as $ from 'svelte/internal/server';
import CheckIcon from "@lucide/svelte/icons/check";
import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
import { useId } from "bits-ui";
import { tick } from "svelte";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

export default function Preset_selector($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { presets } = $$props;
		let open = false;
		let value = "";
		const selectedValue = $.derived(() => presets.find((f) => f.name === value)?.name ?? "Load a preset...");
		let triggerId = useId();

		// We want to refocus the trigger button when the user selects
		// an item from the list so users can continue navigating the
		// rest of the form with the keyboard.
		function closeAndFocusTrigger(triggerId) {
			open = false;

			tick().then(() => {
				document.getElementById(triggerId)?.focus();
			});
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
						if (Popover.Trigger) {
							$$renderer.push('<!--[-->');

							Popover.Trigger($$renderer, {
								class: buttonVariants({
									variant: "outline",
									class: "flex-1 justify-between md:max-w-[200px] lg:max-w-[300px]"
								}),
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
								class: 'w-full p-0 md:w-[200px] lg:w-[300px]',
								children: ($$renderer) => {
									if (Command.Root) {
										$$renderer.push('<!--[-->');

										Command.Root($$renderer, {
											children: ($$renderer) => {
												if (Command.Input) {
													$$renderer.push('<!--[-->');
													Command.Input($$renderer, { placeholder: 'Search presets...' });
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
																		$$renderer.push(`<!---->No presets found.`);
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
																	heading: 'Examples',
																	children: ($$renderer) => {
																		$$renderer.push(`<!--[-->`);

																		const each_array = $.ensure_array_like(presets);

																		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																			let preset = each_array[$$index];

																			if (Command.Item) {
																				$$renderer.push('<!--[-->');

																				Command.Item($$renderer, {
																					value: preset.name,
																					class: 'aria-selected:bg-primary aria-selected:text-primary-foreground',
																					onSelect: () => {
																						value = preset.name;
																						closeAndFocusTrigger(triggerId);
																					},

																					children: ($$renderer) => {
																						$$renderer.push(`<!---->${$.escape(preset.name)} `);

																						CheckIcon($$renderer, {
																							class: cn(value === preset.name ? "opacity-100" : "opacity-0")
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}