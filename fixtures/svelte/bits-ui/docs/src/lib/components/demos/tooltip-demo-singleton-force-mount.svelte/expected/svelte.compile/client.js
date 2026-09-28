import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip } from "bits-ui";
import { fly } from "svelte/transition";

var root = $.from_html(`<div><div><div class="rounded-input border-dark-10 bg-background shadow-popover outline-hidden z-0 w-[300px] border p-3"><p class="text-sm font-semibold"> </p> <p class="text-foreground/70 mt-1 text-xs leading-relaxed"> </p></div></div></div>`);
var root_1 = $.from_html(`<div class="rounded-10px border-border bg-background-alt shadow-mini flex flex-wrap items-center gap-1 border p-1"></div> <!>`, 1);

export default function Tooltip_demo_singleton_force_mount($$anchor, $$props) {
	$.push($$props, true);

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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			delayDuration: 200,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					const children = ($$anchor, $$arg0) => {
						let payload = () => ($$arg0?.()).payload;
						var fragment_2 = root_1();
						var div = $.first_child(fragment_2);

						$.each(div, 21, () => plans, (plan) => plan.id, ($$anchor, plan) => {
							var fragment_3 = $.comment();
							var node_2 = $.first_child(fragment_3);

							$.component(node_2, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
								Tooltip_Trigger($$anchor, {
									get tether() {
										return planTether;
									},

									get payload() {
										return $.get(plan).payload;
									},
									class: 'rounded-9px text-foreground/80 hover:bg-muted data-[state=open]:bg-muted inline-flex h-9 items-center px-3 text-sm font-medium transition-colors',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, $.get(plan).label));
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

									{
										const child = ($$anchor, $$arg0) => {
											let wrapperProps = () => ($$arg0?.()).wrapperProps;
											let props = () => ($$arg0?.()).props;
											let open = () => ($$arg0?.()).open;
											var fragment_6 = $.comment();
											var node_5 = $.first_child(fragment_6);

											{
												var consequent = ($$anchor) => {
													var div_1 = root();

													$.attribute_effect(div_1, () => ({ ...wrapperProps() }));

													var div_2 = $.child(div_1);

													$.attribute_effect(div_2, () => ({ ...props() }));

													var div_3 = $.child(div_2);
													var p = $.child(div_3);
													var text_1 = $.only_child(p, true);
													var p_1 = $.sibling(p, 2);
													var text_2 = $.only_child(p_1, true);

													$.reset(div_3);
													$.reset(div_2);
													$.reset(div_1);

													$.template_effect(() => {
														$.set_text(text_1, payload()?.name ?? "Plan details");
														$.set_text(text_2, payload()?.description ?? "forceMount keeps one tooltip node mounted so transitions stay smooth while content changes.");
													});

													$.transition(3, div_2, () => fly, () => ({ y: 8, duration: 180 }));
													$.append($$anchor, div_1);
												};

												$.if(node_5, ($$render) => {
													if (open()) $$render(consequent);
												});
											}

											$.append($$anchor, fragment_6);
										};

										$.component(node_4, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
											Tooltip_Content($$anchor, {
												sideOffset: 8,
												forceMount: true,
												child,
												$$slots: { child: true }
											});
										});
									}

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
								return planTether;
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