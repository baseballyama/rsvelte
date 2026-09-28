import * as $ from 'svelte/internal/server';
import { Tooltip } from "bits-ui";

export default function Tooltip_demo_tether($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const actionsTether = Tooltip.createTether();

		if (Tooltip.Provider) {
			$$renderer.push('<!--[-->');

			Tooltip.Provider($$renderer, {
				delayDuration: 200,
				children: ($$renderer) => {
					$$renderer.push(`<div class="mx-auto grid w-full max-w-[760px] gap-2 sm:grid-cols-2"><div class="rounded-10px border-border bg-background-alt shadow-mini flex items-center justify-between border p-3"><div><p class="text-sm font-semibold">Data sources</p> <p class="text-foreground/60 mt-0.5 text-xs">Pull live data from connected integrations</p></div> `);

					if (Tooltip.Trigger) {
						$$renderer.push('<!--[-->');

						Tooltip.Trigger($$renderer, {
							tether: actionsTether,
							payload: {
								label: "Sync now",
								description: "Refreshes every connected source and recalculates all metrics.",
								shortcut: "S"
							},
							class: 'rounded-9px bg-background text-foreground/80 ring-dark ring-offset-background shadow-mini hover:bg-muted focus-visible:ring-dark focus-visible:ring-offset-background focus-visible:outline-hidden active:bg-dark-10 inline-flex h-8 shrink-0 items-center justify-center px-3 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Sync now`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div> <div class="rounded-10px border-border bg-background-alt shadow-mini flex items-center justify-between border p-3"><div><p class="text-sm font-semibold">Sharing</p> <p class="text-foreground/60 mt-0.5 text-xs">Share a live view with your team</p></div> `);

					if (Tooltip.Trigger) {
						$$renderer.push('<!--[-->');

						Tooltip.Trigger($$renderer, {
							tether: actionsTether,
							payload: {
								label: "Copy share link",
								description: "Creates a read-only link with the current filter and date range.",
								shortcut: "L"
							},
							class: 'rounded-9px bg-background text-foreground/80 ring-dark ring-offset-background shadow-mini hover:bg-muted focus-visible:ring-dark focus-visible:ring-offset-background focus-visible:outline-hidden active:bg-dark-10 inline-flex h-8 shrink-0 items-center justify-center px-3 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Copy link`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div> <div class="rounded-10px border-border bg-background-alt shadow-mini flex items-center justify-between border p-3 sm:col-span-2"><div><p class="text-sm font-semibold">Automation</p> <p class="text-foreground/60 mt-0.5 text-xs">Send recurring summaries to your team</p></div> <div class="flex items-center gap-2">`);

					if (Tooltip.Trigger) {
						$$renderer.push('<!--[-->');

						Tooltip.Trigger($$renderer, {
							tether: actionsTether,
							payload: {
								label: "Schedule digest",
								description: "Sends this dashboard summary to your team every Monday at 9:00 AM.",
								shortcut: "D"
							},
							class: 'rounded-9px bg-background text-foreground/80 ring-dark ring-offset-background shadow-mini hover:bg-muted focus-visible:ring-dark focus-visible:ring-offset-background focus-visible:outline-hidden active:bg-dark-10 inline-flex h-8 shrink-0 items-center justify-center px-3 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Schedule digest`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Tooltip.Trigger) {
						$$renderer.push('<!--[-->');

						Tooltip.Trigger($$renderer, {
							tether: actionsTether,
							payload: {
								label: "Pause digest",
								description: "Stops all scheduled sends while keeping existing recipients intact.",
								shortcut: "P"
							},
							class: 'rounded-9px bg-background text-foreground/80 ring-dark ring-offset-background shadow-mini hover:bg-muted focus-visible:ring-dark focus-visible:ring-offset-background focus-visible:outline-hidden active:bg-dark-10 inline-flex h-8 shrink-0 items-center justify-center px-3 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Pause digest`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div></div></div> `);

					{
						function children($$renderer, { payload }) {
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
													$$renderer.push(`<div class="rounded-input border-dark-10 bg-background shadow-popover outline-hidden z-0 w-[280px] border p-3"><div class="flex items-center justify-between gap-2"><p class="text-sm font-semibold">${$.escape(payload?.label ?? "Action")}</p> <kbd class="border-dark-10 text-foreground/65 bg-background-alt rounded-[4px] border px-1.5 py-0.5 font-mono text-[11px]">${$.escape(payload?.shortcut ?? "?")}</kbd></div> <p class="text-foreground/70 mt-1 text-xs leading-relaxed">${$.escape(payload?.description ?? "Hover a detached action button to see what it does.")}</p></div>`);
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
							Tooltip.Root($$renderer, { tether: actionsTether, children, $$slots: { default: true } });
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