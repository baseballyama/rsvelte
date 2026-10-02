import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip } from "bits-ui";

var root = $.from_html(`<div class="rounded-input border-dark-10 bg-background shadow-popover outline-hidden z-0 w-[280px] border p-3"><div class="flex items-center justify-between gap-2"><p class="text-sm font-semibold"> </p> <kbd class="border-dark-10 text-foreground/65 bg-background-alt rounded-[4px] border px-1.5 py-0.5 font-mono text-[11px]"> </kbd></div> <p class="text-foreground/70 mt-1 text-xs leading-relaxed"> </p></div>`);
var root_1 = $.from_html(`<div class="mx-auto grid w-full max-w-[760px] gap-2 sm:grid-cols-2"><div class="rounded-10px border-border bg-background-alt shadow-mini flex items-center justify-between border p-3"><div><p class="text-sm font-semibold">Data sources</p> <p class="text-foreground/60 mt-0.5 text-xs">Pull live data from connected integrations</p></div> <!></div> <div class="rounded-10px border-border bg-background-alt shadow-mini flex items-center justify-between border p-3"><div><p class="text-sm font-semibold">Sharing</p> <p class="text-foreground/60 mt-0.5 text-xs">Share a live view with your team</p></div> <!></div> <div class="rounded-10px border-border bg-background-alt shadow-mini flex items-center justify-between border p-3 sm:col-span-2"><div><p class="text-sm font-semibold">Automation</p> <p class="text-foreground/60 mt-0.5 text-xs">Send recurring summaries to your team</p></div> <div class="flex items-center gap-2"><!> <!></div></div></div> <!>`, 1);

export default function Tooltip_demo_tether($$anchor, $$props) {
	$.push($$props, true);

	const actionsTether = Tooltip.createTether();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			delayDuration: 200,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var div = $.first_child(fragment_1);
				var div_1 = $.child(div);
				var node_1 = $.sibling($.child(div_1), 2);

				$.component(node_1, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
					Tooltip_Trigger($$anchor, {
						get tether() {
							return actionsTether;
						},

						payload: {
							label: "Sync now",
							description: "Refreshes every connected source and recalculates all metrics.",
							shortcut: "S"
						},
						class: 'rounded-9px bg-background text-foreground/80 ring-dark ring-offset-background shadow-mini hover:bg-muted focus-visible:ring-dark focus-visible:ring-offset-background focus-visible:outline-hidden active:bg-dark-10 inline-flex h-8 shrink-0 items-center justify-center px-3 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Sync now');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var node_2 = $.sibling($.child(div_2), 2);

				$.component(node_2, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_1) => {
					Tooltip_Trigger_1($$anchor, {
						get tether() {
							return actionsTether;
						},

						payload: {
							label: "Copy share link",
							description: "Creates a read-only link with the current filter and date range.",
							shortcut: "L"
						},
						class: 'rounded-9px bg-background text-foreground/80 ring-dark ring-offset-background shadow-mini hover:bg-muted focus-visible:ring-dark focus-visible:ring-offset-background focus-visible:outline-hidden active:bg-dark-10 inline-flex h-8 shrink-0 items-center justify-center px-3 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Copy link');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var div_4 = $.sibling($.child(div_3), 2);
				var node_3 = $.child(div_4);

				$.component(node_3, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_2) => {
					Tooltip_Trigger_2($$anchor, {
						get tether() {
							return actionsTether;
						},

						payload: {
							label: "Schedule digest",
							description: "Sends this dashboard summary to your team every Monday at 9:00 AM.",
							shortcut: "D"
						},
						class: 'rounded-9px bg-background text-foreground/80 ring-dark ring-offset-background shadow-mini hover:bg-muted focus-visible:ring-dark focus-visible:ring-offset-background focus-visible:outline-hidden active:bg-dark-10 inline-flex h-8 shrink-0 items-center justify-center px-3 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Schedule digest');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_3, 2);

				$.component(node_4, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_3) => {
					Tooltip_Trigger_3($$anchor, {
						get tether() {
							return actionsTether;
						},

						payload: {
							label: "Pause digest",
							description: "Stops all scheduled sends while keeping existing recipients intact.",
							shortcut: "P"
						},
						class: 'rounded-9px bg-background text-foreground/80 ring-dark ring-offset-background shadow-mini hover:bg-muted focus-visible:ring-dark focus-visible:ring-offset-background focus-visible:outline-hidden active:bg-dark-10 inline-flex h-8 shrink-0 items-center justify-center px-3 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Pause digest');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_4);
				$.reset(div_3);
				$.reset(div);

				var node_5 = $.sibling(div, 2);

				{
					const children = ($$anchor, $$arg0) => {
						let payload = () => ($$arg0?.()).payload;
						var fragment_2 = $.comment();
						var node_6 = $.first_child(fragment_2);

						$.component(node_6, () => Tooltip.Portal, ($$anchor, Tooltip_Portal) => {
							Tooltip_Portal($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_7 = $.first_child(fragment_3);

									$.component(node_7, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
										Tooltip_Content($$anchor, {
											sideOffset: 8,
											class: 'data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--bits-tooltip-content-transform-origin)',
											children: ($$anchor, $$slotProps) => {
												var div_5 = root();
												var div_6 = $.child(div_5);
												var p = $.child(div_6);
												var text_4 = $.only_child(p, true);
												var kbd = $.sibling(p, 2);
												var text_5 = $.only_child(kbd, true);

												$.reset(div_6);

												var p_1 = $.sibling(div_6, 2);
												var text_6 = $.only_child(p_1, true);

												$.reset(div_5);

												$.template_effect(() => {
													$.set_text(text_4, payload()?.label ?? "Action");
													$.set_text(text_5, payload()?.shortcut ?? "?");
													$.set_text(text_6, payload()?.description ?? "Hover a detached action button to see what it does.");
												});

												$.append($$anchor, div_5);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					};

					$.component(node_5, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
						Tooltip_Root($$anchor, {
							get tether() {
								return actionsTether;
							},
							children,
							$$slots: { default: true }
						});
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}