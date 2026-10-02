import * as $ from 'svelte/internal/server';
import CircleIcon from "@lucide/svelte/icons/circle";
import CircleArrowUpIcon from "@lucide/svelte/icons/circle-arrow-up";
import CircleCheckIcon from "@lucide/svelte/icons/circle-check";
import CircleHelpIcon from "@lucide/svelte/icons/circle-help";
import CircleXIcon from "@lucide/svelte/icons/circle-x";
import { useId } from "bits-ui";
import { tick } from "svelte";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

export default function Combobox_popover($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const statuses = [
			{ value: "backlog", label: "Backlog", icon: CircleHelpIcon },
			{ value: "todo", label: "Todo", icon: CircleIcon },
			{
				value: "in progress",
				label: "In Progress",
				icon: CircleArrowUpIcon
			},
			{ value: "done", label: "Done", icon: CircleCheckIcon },
			{ value: "canceled", label: "Canceled", icon: CircleXIcon }
		];

		let open = false;
		let value = "";
		const selectedStatus = $.derived(() => statuses.find((s) => s.value === value));

		// We want to refocus the trigger button when the user selects
		// an item from the list so users can continue navigating the
		// rest of the form with the keyboard.
		function closeAndFocusTrigger(triggerId) {
			open = false;

			tick().then(() => {
				document.getElementById(triggerId)?.focus();
			});
		}

		const triggerId = useId();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex items-center space-x-4"><p class="text-sm text-muted-foreground">Status</p> `);

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
								id: triggerId,
								class: buttonVariants({
									variant: "outline",
									size: "sm",
									class: "w-[150px] justify-start"
								}),

								children: ($$renderer) => {
									if (selectedStatus()) {
										$$renderer.push('<!--[0-->');

										const Icon = selectedStatus().icon;

										if (Icon) {
											$$renderer.push('<!--[-->');
											Icon($$renderer, { class: 'me-2 size-4 shrink-0' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` ${$.escape(selectedStatus().label)}`);
									} else {
										$$renderer.push(`<!--[-1-->+ Set status`);
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

						if (Popover.Content) {
							$$renderer.push('<!--[-->');

							Popover.Content($$renderer, {
								class: 'w-[200px] p-0',
								side: 'right',
								align: 'start',
								children: ($$renderer) => {
									if (Command.Root) {
										$$renderer.push('<!--[-->');

										Command.Root($$renderer, {
											children: ($$renderer) => {
												if (Command.Input) {
													$$renderer.push('<!--[-->');
													Command.Input($$renderer, { placeholder: 'Change status...' });
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
																	children: ($$renderer) => {
																		$$renderer.push(`<!--[-->`);

																		const each_array = $.ensure_array_like(statuses);

																		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																			let status = each_array[$$index];

																			if (Command.Item) {
																				$$renderer.push('<!--[-->');

																				Command.Item($$renderer, {
																					value: status.value,
																					onSelect: () => {
																						value = status.value;
																						closeAndFocusTrigger(triggerId);
																					},

																					children: ($$renderer) => {
																						const Icon = status.icon;

																						if (Icon) {
																							$$renderer.push('<!--[-->');

																							Icon($$renderer, {
																								class: cn("me-2 size-4", status.value !== selectedStatus()?.value && "text-foreground/40")
																							});

																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}

																						$$renderer.push(` <span>${$.escape(status.label)}</span>`);
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