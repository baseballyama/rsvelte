import * as $ from 'svelte/internal/server';
import * as Command from "$lib/components/ui/command/index.js";
import * as Popover from "$lib/components/ui/popover/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { timezone, selectedTimezone } from "$lib/stores/timezone";
import Globe from "@lucide/svelte/icons/globe";
import CheckIcon from "@lucide/svelte/icons/check";
import { tick } from "svelte";
import { cn } from "$lib/utils.js";
import trackEvent from "$lib/beacon";

export default function TimezoneSelector($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { compact = false } = $$props;
		let open = false;
		let triggerRef = null;

		// Handle timezone change
		function handleTimezoneSelect(tz) {
			if (tz && tz !== $.store_get($$store_subs ??= {}, '$selectedTimezone', selectedTimezone)) {
				timezone.setTimezone(tz);
				trackEvent("timezone_changed", { timezone: tz });
			}

			closeAndFocusTrigger();
		}

		// Refocus the trigger button when the user selects an item
		function closeAndFocusTrigger() {
			open = false;

			tick().then(() => {
				triggerRef?.focus();
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
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									props,
									{
										variant: 'outline',
										size: 'sm',
										class: cn("ksel bg-background/80 dark:bg-background/70 border-foreground/10 rounded-full border text-xs font-medium shadow-none backdrop-blur-md", compact ? "size-8 p-0" : "max-w-[10rem] sm:max-w-none"),
										role: 'combobox',
										'aria-expanded': open,
										children: ($$renderer) => {
											Globe($$renderer, { class: 'text-inherit' });
											$$renderer.push(`<!----> `);

											if (compact) {
												$$renderer.push(`<!--[0--><span class="sr-only">${$.escape($.store_get($$store_subs ??= {}, '$selectedTimezone', selectedTimezone))}</span>`);
											} else {
												$$renderer.push(`<!--[-1--><span class="truncate">${$.escape($.store_get($$store_subs ??= {}, '$selectedTimezone', selectedTimezone))}</span>`);
											}

											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Popover.Trigger) {
								$$renderer.push('<!--[-->');

								Popover.Trigger($$renderer, {
									get ref() {
										return triggerRef;
									},

									set ref($$value) {
										triggerRef = $$value;
										$$settled = false;
									},
									child,
									$$slots: { child: true }
								});

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
								class: 'w-[280px] p-0',
								children: ($$renderer) => {
									if (Command.Root) {
										$$renderer.push('<!--[-->');

										Command.Root($$renderer, {
											children: ($$renderer) => {
												if (Command.Input) {
													$$renderer.push('<!--[-->');
													Command.Input($$renderer, { placeholder: 'Search timezone...' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Command.List) {
													$$renderer.push('<!--[-->');

													Command.List($$renderer, {
														class: 'max-h-60',
														children: ($$renderer) => {
															if (Command.Empty) {
																$$renderer.push('<!--[-->');

																Command.Empty($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->No timezone found.`);
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

																		const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$timezone', timezone).availableTimezones);

																		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																			let tz = each_array[$$index];

																			if (Command.Item) {
																				$$renderer.push('<!--[-->');

																				Command.Item($$renderer, {
																					value: tz,
																					onSelect: () => handleTimezoneSelect(tz),
																					class: 'text-xs',
																					children: ($$renderer) => {
																						CheckIcon($$renderer, {
																							class: cn("me-2 size-4", $.store_get($$store_subs ??= {}, '$selectedTimezone', selectedTimezone) !== tz && "text-transparent")
																						});

																						$$renderer.push(`<!----> ${$.escape(tz)}`);
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}