import * as $ from 'svelte/internal/server';
import * as Alert from "$lib/registry/ui/alert/index.js";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Activate_agent_dialog($$renderer) {
	const agentFeatures = [
		{
			id: "code-reviews",
			title: "Code reviews",
			description: "with full codebase context to catch",
			highlight: "hard-to-find",
			endText: "bugs."
		},

		{
			id: "code-suggestions",
			title: "Code suggestions",
			description: "validated in sandboxes before you merge."
		},

		{
			id: "root-cause",
			title: "Root-cause analysis",
			description: "for production issues with deployment context.",
			hasBadge: true
		}
	];

	Example($$renderer, {
		title: 'Activate Agent',
		class: 'items-center justify-center',
		children: ($$renderer) => {
			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									{ variant: 'outline' },
									props,
									{
										children: ($$renderer) => {
											$$renderer.push(`<!---->Activate Agent`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Dialog.Trigger) {
								$$renderer.push('<!--[-->');
								Dialog.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								showCloseButton: false,
								children: ($$renderer) => {
									if (Dialog.Header) {
										$$renderer.push('<!--[-->');

										Dialog.Header($$renderer, {
											children: ($$renderer) => {
												if (Dialog.Title) {
													$$renderer.push('<!--[-->');

													Dialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Ship faster &amp; safer with Vercel Agent`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Dialog.Description) {
													$$renderer.push('<!--[-->');

													Dialog.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Your use is subject to Vercel's <a href="#/">Public Beta Agreement</a> and <a href="#/">AI Product Terms</a>.`);
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

									$$renderer.push(` <div class="no-scrollbar flex max-h-[50vh] flex-col gap-4 overflow-y-auto">`);

									if (Item.Group) {
										$$renderer.push('<!--[-->');

										Item.Group($$renderer, {
											class: 'gap-0 pr-2',
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array = $.ensure_array_like(agentFeatures);

												for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
													let feature = each_array[$$index];

													if (Item.Root) {
														$$renderer.push('<!--[-->');

														Item.Root($$renderer, {
															size: 'xs',
															class: 'px-0',
															children: ($$renderer) => {
																if (Item.Media) {
																	$$renderer.push('<!--[-->');

																	Item.Media($$renderer, {
																		variant: 'icon',
																		class: 'self-start',
																		children: ($$renderer) => {
																			IconPlaceholder($$renderer, {
																				lucide: 'CheckCircle2Icon',
																				tabler: 'IconCircleCheckFilled',
																				hugeicons: 'CheckmarkCircle02Icon',
																				phosphor: 'CheckCircleIcon',
																				remixicon: 'RiCheckboxCircleLine',
																				class: 'size-5 fill-primary text-primary-foreground'
																			});
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
																		children: ($$renderer) => {
																			if (Item.Title) {
																				$$renderer.push('<!--[-->');

																				Item.Title($$renderer, {
																					class: 'inline leading-relaxed font-normal text-muted-foreground *:[strong]:font-medium *:[strong]:text-foreground',
																					children: ($$renderer) => {
																						$$renderer.push(`<strong>${$.escape(feature.title)}</strong> ${$.escape(feature.description)} `);

																						if (feature.highlight) {
																							$$renderer.push(`<!--[0--><strong>${$.escape(feature.highlight)}</strong> ${$.escape(feature.endText)}`);
																						} else {
																							$$renderer.push('<!--[-1-->');
																						}

																						$$renderer.push(`<!--]--> `);

																						if (feature.hasBadge) {
																							$$renderer.push('<!--[0-->');

																							Badge($$renderer, {
																								variant: 'secondary',
																								class: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->Requires Observability Plus`);
																								},
																								$$slots: { default: true }
																							});
																						} else {
																							$$renderer.push('<!--[-1-->');
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

									if (Alert.Root) {
										$$renderer.push('<!--[-->');

										Alert.Root($$renderer, {
											class: 'hidden sm:grid',
											children: ($$renderer) => {
												IconPlaceholder($$renderer, {
													lucide: 'CircleDollarSignIcon',
													hugeicons: 'DollarCircleIcon',
													tabler: 'IconCoin',
													phosphor: 'CurrencyCircleDollarIcon',
													remixicon: 'RiMoneyDollarCircleLine'
												});

												$$renderer.push(`<!----> `);

												if (Alert.Description) {
													$$renderer.push('<!--[-->');

													Alert.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Pro teams get $100 in Vercel Agent trial credit for 2 weeks.`);
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

									$$renderer.push(`</div> `);

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											children: ($$renderer) => {
												{
													function child($$renderer, { props }) {
														Button($$renderer, $.spread_props([
															{ variant: 'outline' },
															props,
															{
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Cancel`);
																},
																$$slots: { default: true }
															}
														]));
													}

													if (Dialog.Close) {
														$$renderer.push('<!--[-->');
														Dialog.Close($$renderer, { child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(` `);

												Button($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Enable with $100 credits`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
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
}