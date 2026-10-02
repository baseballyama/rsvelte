import * as $ from 'svelte/internal/server';
import { Tooltip } from "bits-ui";
import { fly } from "svelte/transition";

export default function Tooltip_demo_singleton_force_mount($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const planTether = Tooltip.createTether();

		const plans = [
			{
				id: "starter",
				label: "Starter",
				payload: {
					name: "Starter plan",
					description: "Great for small teams shipping one project with basic analytics."
				}
			},

			{
				id: "growth",
				label: "Growth",
				payload: {
					name: "Growth plan",
					description: "Adds feature flags, role permissions, and alert integrations."
				}
			},

			{
				id: "enterprise",
				label: "Enterprise",
				payload: {
					name: "Enterprise plan",
					description: "Includes SSO, audit trails, and dedicated support response SLAs."
				}
			}
		];

		if (Tooltip.Provider) {
			$$renderer.push('<!--[-->');

			Tooltip.Provider($$renderer, {
				delayDuration: 200,
				children: ($$renderer) => {
					{
						function children($$renderer, { payload }) {
							$$renderer.push(`<div class="rounded-10px border-border bg-background-alt shadow-mini flex flex-wrap items-center gap-1 border p-1"><!--[-->`);

							const each_array = $.ensure_array_like(plans);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let plan = each_array[$$index];

								if (Tooltip.Trigger) {
									$$renderer.push('<!--[-->');

									Tooltip.Trigger($$renderer, {
										tether: planTether,
										payload: plan.payload,
										class: 'rounded-9px text-foreground/80 hover:bg-muted data-[state=open]:bg-muted inline-flex h-9 items-center px-3 text-sm font-medium transition-colors',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(plan.label)}`);
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
										{
											function child($$renderer, { wrapperProps, props, open }) {
												if (open) {
													$$renderer.push(`<!--[0--><div${$.attributes({ ...wrapperProps })}><div${$.attributes({ ...props })}><div class="rounded-input border-dark-10 bg-background shadow-popover outline-hidden z-0 w-[300px] border p-3"><p class="text-sm font-semibold">${$.escape(payload?.name ?? "Plan details")}</p> <p class="text-foreground/70 mt-1 text-xs leading-relaxed">${$.escape(payload?.description ?? "forceMount keeps one tooltip node mounted so transitions stay smooth while content changes.")}</p></div></div></div>`);
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]-->`);
											}

											if (Tooltip.Content) {
												$$renderer.push('<!--[-->');

												Tooltip.Content($$renderer, {
													sideOffset: 8,
													forceMount: true,
													child,
													$$slots: { child: true }
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

						if (Tooltip.Root) {
							$$renderer.push('<!--[-->');
							Tooltip.Root($$renderer, { tether: planTether, children, $$slots: { default: true } });
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