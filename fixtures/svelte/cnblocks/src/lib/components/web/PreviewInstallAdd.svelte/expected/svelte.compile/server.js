import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import * as Add from "$lib/components/ui/add";
import { AGENTS } from "$lib/components/ui/add";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "$lib/components/ui/hover-card";
import { cn } from "$lib/utils";
import { getRegistryItemUrl } from "$lib/utils/registry-url";
import { PersistedState } from "runed";

export default function PreviewInstallAdd($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			itemId,
			registryPath = "r",
			registryOptions = ["@sv/cnblocks"],
			registry,
			class: className = ""
		} = $$props;

		let agent = new PersistedState("user-agent-preference", "pnpm");

		let newRegistryPath = $.derived(() => {
			let pathname = page.url.pathname.toString();

			if (pathname.includes("mist")) return "m";
			if (pathname.includes("veil")) return "v";

			return registryPath;
		});

		let installUrl = $.derived(() => itemId
			? getRegistryItemUrl(page.url.origin, page.url.pathname, itemId, newRegistryPath())
			: "");

		let showRegistryOptions = $.derived(() => registryOptions.length > 1);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (installUrl()) {
				$$renderer.push('<!--[0-->');

				if (Add.Provider) {
					$$renderer.push('<!--[-->');

					Add.Provider($$renderer, {
						registry: '',
						registryOptions: [installUrl()],
						get agent() {
							return agent.current;
						},

						set agent($$value) {
							agent.current = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Add.Root) {
								$$renderer.push('<!--[-->');

								Add.Root($$renderer, {
									item: installUrl(),
									children: ($$renderer) => {
										HoverCard($$renderer, {
											openDelay: 200,
											children: ($$renderer) => {
												{
													function child($$renderer, { props }) {
														if (Add.Group) {
															$$renderer.push('<!--[-->');

															Add.Group($$renderer, $.spread_props([
																props,
																{
																	class: cn("h-8 w-80 max-w-full", className),
																	children: ($$renderer) => {
																		if (Add.Button) {
																			$$renderer.push('<!--[-->');
																			Add.Button($$renderer, { class: 'h-8 min-w-0 md:pr-2 md:pl-2 [&>div]:size-8' });
																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Add.GroupSeparator) {
																			$$renderer.push('<!--[-->');
																			Add.GroupSeparator($$renderer, { class: 'h-4' });
																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Add.Dropdown) {
																			$$renderer.push('<!--[-->');

																			Add.Dropdown($$renderer, {
																				class: 'size-8',
																				children: ($$renderer) => {
																					if (Add.DropdownContent) {
																						$$renderer.push('<!--[-->');

																						Add.DropdownContent($$renderer, {
																							children: ($$renderer) => {
																								$$renderer.push(`<!--[-->`);

																								const each_array = $.ensure_array_like(AGENTS);

																								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																									let addAgent = each_array[$$index];

																									if (Add.DropdownAgentOption) {
																										$$renderer.push('<!--[-->');
																										Add.DropdownAgentOption($$renderer, { agent: addAgent });
																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}
																								}

																								$$renderer.push(`<!--]--> `);

																								if (showRegistryOptions()) {
																									$$renderer.push('<!--[0-->');

																									if (Add.DropdownSeparator) {
																										$$renderer.push('<!--[-->');
																										Add.DropdownSeparator($$renderer, {});
																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` <!--[-->`);

																									const each_array_1 = $.ensure_array_like(registryOptions);

																									for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																										let option = each_array_1[$$index_1];

																										if (Add.DropdownRegistryOption) {
																											$$renderer.push('<!--[-->');
																											Add.DropdownRegistryOption($$renderer, { registry: option });
																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}
																									}

																									$$renderer.push(`<!--]-->`);
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
																}
															]));

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													}

													HoverCardTrigger($$renderer, { child, $$slots: { child: true } });
												}

												$$renderer.push(`<!----> `);

												HoverCardContent($$renderer, {
													class: 'w-fit px-3 py-1.5',
													children: ($$renderer) => {
														$$renderer.push(`<p class="font-mono text-xs leading-relaxed break-all">${$.escape(installUrl())}</p>`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});
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
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}