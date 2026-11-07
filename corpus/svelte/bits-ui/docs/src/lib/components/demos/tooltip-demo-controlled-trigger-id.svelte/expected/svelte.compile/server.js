import * as $ from 'svelte/internal/server';
import { Tooltip } from "bits-ui";
import CursorClick from "phosphor-svelte/lib/CursorClick";

export default function Tooltip_demo_controlled_trigger_id($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const setupTether = Tooltip.createTether();
		let open = false;
		let triggerId = null;

		function openStep(id) {
			triggerId = id;
			open = true;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Tooltip.Provider) {
				$$renderer.push('<!--[-->');

				Tooltip.Provider($$renderer, {
					delayDuration: 200,
					children: ($$renderer) => {
						$$renderer.push(`<div class="flex w-full flex-col items-center gap-3"><div class="rounded-10px border-border bg-background-alt shadow-mini inline-flex w-fit items-center border p-1">`);

						if (Tooltip.Trigger) {
							$$renderer.push('<!--[-->');

							Tooltip.Trigger($$renderer, {
								id: 'setup-project',
								tether: setupTether,
								payload: {
									title: "Create project",
									description: "Projects keep workflows, environments, and permissions scoped to one team."
								},
								class: 'rounded-9px text-foreground/80 hover:bg-muted inline-flex h-9 items-center px-3 text-sm font-medium',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Project`);
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
								id: 'setup-members',
								tether: setupTether,
								payload: {
									title: "Invite members",
									description: "Add collaborators now so every task gets ownership from day one."
								},
								class: 'rounded-9px text-foreground/80 hover:bg-muted inline-flex h-9 items-center px-3 text-sm font-medium',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Members`);
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
								id: 'setup-deploy',
								tether: setupTether,
								payload: {
									title: "Configure deploy",
									description: "Connect a repository and pick a production branch for one-click releases."
								},
								class: 'rounded-9px text-foreground/80 hover:bg-muted inline-flex h-9 items-center px-3 text-sm font-medium',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Deploy`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(`</div> <div class="flex w-full max-w-xs items-center gap-3"><div class="bg-border h-px flex-1"></div> <span class="text-foreground/35 text-[10px] font-medium uppercase tracking-widest">open directly</span> <div class="bg-border h-px flex-1"></div></div> <div class="flex flex-wrap items-center justify-center gap-2"><button type="button" class="border-border bg-background-alt shadow-mini hover:bg-muted focus-visible:ring-dark focus-visible:ring-offset-background focus-visible:outline-hidden group inline-flex h-8 items-center gap-1.5 rounded-full border px-4 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]">`);

						CursorClick($$renderer, {
							class: 'text-foreground/40 group-hover:text-foreground/60 size-3.5 transition-colors'
						});

						$$renderer.push(`<!----> <span class="text-foreground/65 group-hover:text-foreground/80 transition-colors">Members</span></button> <button type="button" class="border-border bg-background-alt shadow-mini hover:bg-muted focus-visible:ring-dark focus-visible:ring-offset-background focus-visible:outline-hidden group inline-flex h-8 items-center gap-1.5 rounded-full border px-4 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]">`);

						CursorClick($$renderer, {
							class: 'text-foreground/40 group-hover:text-foreground/60 size-3.5 transition-colors'
						});

						$$renderer.push(`<!----> <span class="text-foreground/65 group-hover:text-foreground/80 transition-colors">Deploy</span></button></div></div> `);

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
													class: 'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 origin-(--bits-tooltip-content-transform-origin)',
													children: ($$renderer) => {
														$$renderer.push(`<div class="rounded-input border-dark-10 bg-background shadow-popover outline-hidden z-0 w-[290px] border p-3"><p class="text-sm font-semibold">${$.escape(payload?.title ?? "Setup step")}</p> <p class="text-foreground/70 mt-1 text-xs leading-relaxed">${$.escape(payload?.description ?? "Open a step manually to guide first-time users.")}</p></div>`);
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

								Tooltip.Root($$renderer, {
									tether: setupTether,
									get open() {
										return open;
									},

									set open($$value) {
										open = $$value;
										$$settled = false;
									},

									get triggerId() {
										return triggerId;
									},

									set triggerId($$value) {
										triggerId = $$value;
										$$settled = false;
									},
									children,
									$$slots: { default: true }
								});

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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}