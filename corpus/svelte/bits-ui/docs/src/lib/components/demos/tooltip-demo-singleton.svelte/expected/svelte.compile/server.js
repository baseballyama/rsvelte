import * as $ from 'svelte/internal/server';
import { Tooltip } from "bits-ui";

export default function Tooltip_demo_singleton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		if (Tooltip.Provider) {
			$$renderer.push('<!--[-->');

			Tooltip.Provider($$renderer, {
				delayDuration: 200,
				skipDelayDuration: 600,
				children: ($$renderer) => {
					{
						function children($$renderer, { payload }) {
							$$renderer.push(`<div class="rounded-10px border-border bg-background-alt shadow-mini flex flex-wrap items-center gap-1 border p-1"><!--[-->`);

							const each_array = $.ensure_array_like(columns);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let column = each_array[$$index];

								if (Tooltip.Trigger) {
									$$renderer.push('<!--[-->');

									Tooltip.Trigger($$renderer, {
										tether: boardTether,
										payload: column.payload,
										class: 'rounded-9px text-foreground/80 hover:bg-muted data-[state=open]:bg-muted inline-flex h-9 items-center px-3 text-sm font-medium transition-colors',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(column.label)}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(`<!--]--></div> `);

							if (Tooltip.Portal) {
								$$renderer.push('<!--[-->');

								Tooltip.Portal($$renderer, {
									children: ($$renderer) => {
										if (Tooltip.Content) {
											$$renderer.push('<!--[-->');

											Tooltip.Content($$renderer, {
												sideOffset: 8,
												class: 'data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--bits-tooltip-content-transform-origin)',
												children: ($$renderer) => {
													$$renderer.push(`<div class="rounded-input border-dark-10 bg-background shadow-popover outline-hidden z-0 w-[280px] border p-3"><p class="text-sm font-semibold">${$.escape(payload?.name ?? "Column")}</p> <p class="text-foreground/70 mt-1 text-xs leading-relaxed">${$.escape(payload?.description ?? "Hover a column to see team workflow guidance.")}</p></div>`);
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

						if (Tooltip.Root) {
							$$renderer.push('<!--[-->');
							Tooltip.Root($$renderer, { tether: boardTether, children, $$slots: { default: true } });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}