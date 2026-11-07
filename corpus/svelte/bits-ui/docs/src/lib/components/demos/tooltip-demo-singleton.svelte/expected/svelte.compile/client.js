import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip } from "bits-ui";

var root = $.from_html(`<div class="rounded-input border-dark-10 bg-background shadow-popover outline-hidden z-0 w-[280px] border p-3"><p class="text-sm font-semibold"> </p> <p class="text-foreground/70 mt-1 text-xs leading-relaxed"> </p></div>`);
var root_1 = $.from_html(`<div class="rounded-10px border-border bg-background-alt shadow-mini flex flex-wrap items-center gap-1 border p-1"></div> <!>`, 1);

export default function Tooltip_demo_singleton($$anchor, $$props) {
	$.push($$props, true);

	const boardTether = Tooltip.createTether();

	const columns = [
		{
			id: "backlog",
			label: "Backlog",
			payload: {
				name: "Backlog",
				description: "Unstarted ideas and tasks waiting to be scoped and prioritized."
			}
		},

		{
			id: "in-progress",
			label: "In Progress",
			payload: {
				name: "In Progress",
				description: "Active work with an assignee and an expected ship date."
			}
		},

		{
			id: "blocked",
			label: "Blocked",
			payload: {
				name: "Blocked",
				description: "Work that cannot move until an external dependency is resolved."
			}
		},

		{
			id: "done",
			label: "Done",
			payload: {
				name: "Done",
				description: "Completed tasks ready for release notes and QA sign-off."
			}
		}
	];

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			delayDuration: 200,
			skipDelayDuration: 600,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					const children = ($$anchor, $$arg0) => {
						let payload = () => ($$arg0?.()).payload;
						var fragment_2 = root_1();
						var div = $.first_child(fragment_2);

						$.each(div, 21, () => columns, (column) => column.id, ($$anchor, column) => {
							var fragment_3 = $.comment();
							var node_2 = $.first_child(fragment_3);

							$.component(node_2, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
								Tooltip_Trigger($$anchor, {
									get tether() {
										return boardTether;
									},

									get payload() {
										return $.get(column).payload;
									},
									class: 'rounded-9px text-foreground/80 hover:bg-muted data-[state=open]:bg-muted inline-flex h-9 items-center px-3 text-sm font-medium transition-colors',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, $.get(column).label));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						});

						$.reset(div);

						var node_3 = $.sibling(div, 2);

						$.component(node_3, () => Tooltip.Portal, ($$anchor, Tooltip_Portal) => {
							Tooltip_Portal($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = $.comment();
									var node_4 = $.first_child(fragment_5);

									$.component(node_4, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
										Tooltip_Content($$anchor, {
											sideOffset: 8,
											class: 'data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--bits-tooltip-content-transform-origin)',
											children: ($$anchor, $$slotProps) => {
												var div_1 = root();
												var p = $.child(div_1);
												var text_1 = $.only_child(p, true);
												var p_1 = $.sibling(p, 2);
												var text_2 = $.only_child(p_1, true);

												$.reset(div_1);

												$.template_effect(() => {
													$.set_text(text_1, payload()?.name ?? "Column");
													$.set_text(text_2, payload()?.description ?? "Hover a column to see team workflow guidance.");
												});

												$.append($$anchor, div_1);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					};

					$.component(node_1, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
						Tooltip_Root($$anchor, {
							get tether() {
								return boardTether;
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