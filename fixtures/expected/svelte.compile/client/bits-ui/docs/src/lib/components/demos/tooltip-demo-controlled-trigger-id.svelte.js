import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip } from "bits-ui";
import CursorClick from "phosphor-svelte/lib/CursorClick";

var root = $.from_html(`<div class="rounded-input border-dark-10 bg-background shadow-popover outline-hidden z-0 w-[290px] border p-3"><p class="text-sm font-semibold"> </p> <p class="text-foreground/70 mt-1 text-xs leading-relaxed"> </p></div>`);
var root_1 = $.from_html(`<div class="flex w-full flex-col items-center gap-3"><div class="rounded-10px border-border bg-background-alt shadow-mini inline-flex w-fit items-center border p-1"><!> <!> <!></div> <div class="flex w-full max-w-xs items-center gap-3"><div class="bg-border h-px flex-1"></div> <span class="text-foreground/35 text-[10px] font-medium uppercase tracking-widest">open directly</span> <div class="bg-border h-px flex-1"></div></div> <div class="flex flex-wrap items-center justify-center gap-2"><button type="button" class="border-border bg-background-alt shadow-mini hover:bg-muted focus-visible:ring-dark focus-visible:ring-offset-background focus-visible:outline-hidden group inline-flex h-8 items-center gap-1.5 rounded-full border px-4 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]"><!> <span class="text-foreground/65 group-hover:text-foreground/80 transition-colors">Members</span></button> <button type="button" class="border-border bg-background-alt shadow-mini hover:bg-muted focus-visible:ring-dark focus-visible:ring-offset-background focus-visible:outline-hidden group inline-flex h-8 items-center gap-1.5 rounded-full border px-4 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]"><!> <span class="text-foreground/65 group-hover:text-foreground/80 transition-colors">Deploy</span></button></div></div> <!>`, 1);

export default function Tooltip_demo_controlled_trigger_id($$anchor, $$props) {
	$.push($$props, true);

	const setupTether = Tooltip.createTether();
	let open = $.state(false);
	let triggerId = $.state(null);

	function openStep(id) {
		$.set(triggerId, id, true);
		$.set(open, true);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			delayDuration: 200,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var div = $.first_child(fragment_1);
				var div_1 = $.child(div);
				var node_1 = $.child(div_1);

				$.component(node_1, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
					Tooltip_Trigger($$anchor, {
						id: 'setup-project',
						get tether() {
							return setupTether;
						},

						payload: {
							title: "Create project",
							description: "Projects keep workflows, environments, and permissions scoped to one team."
						},
						class: 'rounded-9px text-foreground/80 hover:bg-muted inline-flex h-9 items-center px-3 text-sm font-medium',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Project');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_1) => {
					Tooltip_Trigger_1($$anchor, {
						id: 'setup-members',
						get tether() {
							return setupTether;
						},

						payload: {
							title: "Invite members",
							description: "Add collaborators now so every task gets ownership from day one."
						},
						class: 'rounded-9px text-foreground/80 hover:bg-muted inline-flex h-9 items-center px-3 text-sm font-medium',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Members');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_2) => {
					Tooltip_Trigger_2($$anchor, {
						id: 'setup-deploy',
						get tether() {
							return setupTether;
						},

						payload: {
							title: "Configure deploy",
							description: "Connect a repository and pick a production branch for one-click releases."
						},
						class: 'rounded-9px text-foreground/80 hover:bg-muted inline-flex h-9 items-center px-3 text-sm font-medium',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Deploy');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 4);
				var button = $.child(div_2);
				var node_4 = $.child(button);

				CursorClick(node_4, {
					class: 'text-foreground/40 group-hover:text-foreground/60 size-3.5 transition-colors'
				});

				$.next(2);
				$.reset(button);

				var button_1 = $.sibling(button, 2);
				var node_5 = $.child(button_1);

				CursorClick(node_5, {
					class: 'text-foreground/40 group-hover:text-foreground/60 size-3.5 transition-colors'
				});

				$.next(2);
				$.reset(button_1);
				$.reset(div_2);
				$.reset(div);

				var node_6 = $.sibling(div, 2);

				{
					const children = ($$anchor, $$arg0) => {
						let payload = () => ($$arg0?.()).payload;
						var fragment_2 = $.comment();
						var node_7 = $.first_child(fragment_2);

						$.component(node_7, () => Tooltip.Portal, ($$anchor, Tooltip_Portal) => {
							Tooltip_Portal($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_8 = $.first_child(fragment_3);

									$.component(node_8, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
										Tooltip_Content($$anchor, {
											sideOffset: 8,
											class: 'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 origin-(--bits-tooltip-content-transform-origin)',
											children: ($$anchor, $$slotProps) => {
												var div_3 = root();
												var p = $.child(div_3);
												var text_3 = $.only_child(p, true);
												var p_1 = $.sibling(p, 2);
												var text_4 = $.only_child(p_1, true);

												$.reset(div_3);

												$.template_effect(() => {
													$.set_text(text_3, payload()?.title ?? "Setup step");
													$.set_text(text_4, payload()?.description ?? "Open a step manually to guide first-time users.");
												});

												$.append($$anchor, div_3);
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

					$.component(node_6, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
						Tooltip_Root($$anchor, {
							get tether() {
								return setupTether;
							},

							get open() {
								return $.get(open);
							},

							set open($$value) {
								$.set(open, $$value, true);
							},

							get triggerId() {
								return $.get(triggerId);
							},

							set triggerId($$value) {
								$.set(triggerId, $$value, true);
							},
							children,
							$$slots: { default: true }
						});
					});
				}

				$.delegated('click', button, () => openStep("setup-members"));
				$.delegated('click', button_1, () => openStep("setup-deploy"));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);