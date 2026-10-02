import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import CircularGauge from "../../vercel/circular-gauge.svelte";

export default function Usage_card($$renderer) {
	const items = [
		{ name: "Edge Requests", value: "$1.83K", percentage: 67.34 },
		{
			name: "Fast Data Transfer",
			percentage: 52.18,
			value: "$952.51"
		},

		{
			name: "Monitoring data points",
			percentage: 89.42,
			value: "$901.20"
		},

		{
			name: "Web Analytics Events",
			percentage: 45.67,
			value: "$603.71"
		},
		{ name: "ISR Writes", percentage: 26.23, value: "524.52K / 2M" },
		{
			name: "Function Duration",
			percentage: 5.11,
			value: "5.11 GB Hrs / 1K GB Hrs"
		}
	];

	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			class: 'w-full max-w-sm gap-4',
			children: ($$renderer) => {
				if (Card.Header) {
					$$renderer.push('<!--[-->');

					Card.Header($$renderer, {
						children: ($$renderer) => {
							if (Card.Title) {
								$$renderer.push('<!--[-->');

								Card.Title($$renderer, {
									class: 'px-1 text-sm',
									children: ($$renderer) => {
										$$renderer.push(`<!---->5 days remaining in cycle`);
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

				$$renderer.push(` `);

				if (Card.Content) {
					$$renderer.push('<!--[-->');

					Card.Content($$renderer, {
						children: ($$renderer) => {
							if (Item.Group) {
								$$renderer.push('<!--[-->');

								Item.Group($$renderer, {
									class: 'gap-0',
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(items);

										for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
											let item = each_array[$$index];

											{
												function child($$renderer, { props }) {
													$$renderer.push(`<a${$.attributes({ href: '#/', ...props })}>`);

													if (Item.Media) {
														$$renderer.push('<!--[-->');

														Item.Media($$renderer, {
															variant: 'icon',
															class: 'text-primary',
															children: ($$renderer) => {
																CircularGauge($$renderer, { percentage: item.percentage });
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Item.Content) {
														$$renderer.push('<!--[-->');

														Item.Content($$renderer, {
															class: 'inline-block truncate',
															children: ($$renderer) => {
																if (Item.Title) {
																	$$renderer.push('<!--[-->');

																	Item.Title($$renderer, {
																		class: 'inline',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(item.name)}`);
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

													$$renderer.push(` `);

													if (Item.Actions) {
														$$renderer.push('<!--[-->');

														Item.Actions($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<span class="font-mono text-xs font-medium text-muted-foreground tabular-nums">${$.escape(item.value)}</span>`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(`</a>`);
												}

												if (Item.Root) {
													$$renderer.push('<!--[-->');

													Item.Root($$renderer, {
														size: 'xs',
														class: 'px-0 group-hover/item-group:bg-transparent',
														child,
														$$slots: { child: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
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
}