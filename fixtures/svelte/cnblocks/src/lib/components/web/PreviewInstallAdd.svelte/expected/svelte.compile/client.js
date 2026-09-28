import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import * as Add from "$lib/components/ui/add";
import { AGENTS } from "$lib/components/ui/add";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "$lib/components/ui/hover-card";
import { cn } from "$lib/utils";
import { getRegistryItemUrl } from "$lib/utils/registry-url";
import { PersistedState } from "runed";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<p class="font-mono text-xs leading-relaxed break-all"> </p>`);

export default function PreviewInstallAdd($$anchor, $$props) {
	$.push($$props, true);

	let registryPath = $.prop($$props, 'registryPath', 3, "r"),
		registryOptions = $.prop($$props, 'registryOptions', 19, () => ["@sv/cnblocks"]),
		className = $.prop($$props, 'class', 3, "");

	let agent = new PersistedState("user-agent-preference", "pnpm");

	let newRegistryPath = $.derived(() => {
		let pathname = page.url.pathname.toString();

		if (pathname.includes("mist")) return "m";
		if (pathname.includes("veil")) return "v";

		return registryPath();
	});

	let installUrl = $.derived(() => $$props.itemId
		? getRegistryItemUrl(page.url.origin, page.url.pathname, $$props.itemId, $.get(newRegistryPath))
		: "");

	let showRegistryOptions = $.derived(() => registryOptions().length > 1);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => [$.get(installUrl)]);

				$.component(node_1, () => Add.Provider, ($$anchor, Add_Provider) => {
					Add_Provider($$anchor, {
						registry: '',
						get registryOptions() {
							return $.get($0);
						},

						get agent() {
							return agent.current;
						},

						set agent($$value) {
							agent.current = $$value;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Add.Root, ($$anchor, Add_Root) => {
								Add_Root($$anchor, {
									get item() {
										return $.get(installUrl);
									},

									children: ($$anchor, $$slotProps) => {
										HoverCard($$anchor, {
											openDelay: 200,
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_3 = $.first_child(fragment_4);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;
														var fragment_5 = $.comment();
														var node_4 = $.first_child(fragment_5);

														{
															let $0 = $.derived(() => cn("h-8 w-80 max-w-full", className()));

															$.component(node_4, () => Add.Group, ($$anchor, Add_Group) => {
																Add_Group($$anchor, $.spread_props(props, {
																	get class() {
																		return $.get($0);
																	},

																	children: ($$anchor, $$slotProps) => {
																		var fragment_6 = root_1();
																		var node_5 = $.first_child(fragment_6);

																		$.component(node_5, () => Add.Button, ($$anchor, Add_Button) => {
																			Add_Button($$anchor, { class: 'h-8 min-w-0 md:pr-2 md:pl-2 [&>div]:size-8' });
																		});

																		var node_6 = $.sibling(node_5, 2);

																		$.component(node_6, () => Add.GroupSeparator, ($$anchor, Add_GroupSeparator) => {
																			Add_GroupSeparator($$anchor, { class: 'h-4' });
																		});

																		var node_7 = $.sibling(node_6, 2);

																		$.component(node_7, () => Add.Dropdown, ($$anchor, Add_Dropdown) => {
																			Add_Dropdown($$anchor, {
																				class: 'size-8',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_7 = $.comment();
																					var node_8 = $.first_child(fragment_7);

																					$.component(node_8, () => Add.DropdownContent, ($$anchor, Add_DropdownContent) => {
																						Add_DropdownContent($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_8 = root();
																								var node_9 = $.first_child(fragment_8);

																								$.each(node_9, 16, () => AGENTS, (addAgent) => addAgent, ($$anchor, addAgent) => {
																									var fragment_9 = $.comment();
																									var node_10 = $.first_child(fragment_9);

																									$.component(node_10, () => Add.DropdownAgentOption, ($$anchor, Add_DropdownAgentOption) => {
																										Add_DropdownAgentOption($$anchor, {
																											get agent() {
																												return addAgent;
																											}
																										});
																									});

																									$.append($$anchor, fragment_9);
																								});

																								var node_11 = $.sibling(node_9, 2);

																								{
																									var consequent = ($$anchor) => {
																										var fragment_10 = root();
																										var node_12 = $.first_child(fragment_10);

																										$.component(node_12, () => Add.DropdownSeparator, ($$anchor, Add_DropdownSeparator) => {
																											Add_DropdownSeparator($$anchor, {});
																										});

																										var node_13 = $.sibling(node_12, 2);

																										$.each(node_13, 16, registryOptions, (option) => option, ($$anchor, option) => {
																											var fragment_11 = $.comment();
																											var node_14 = $.first_child(fragment_11);

																											$.component(node_14, () => Add.DropdownRegistryOption, ($$anchor, Add_DropdownRegistryOption) => {
																												Add_DropdownRegistryOption($$anchor, {
																													get registry() {
																														return option;
																													}
																												});
																											});

																											$.append($$anchor, fragment_11);
																										});

																										$.append($$anchor, fragment_10);
																									};

																									$.if(node_11, ($$render) => {
																										if ($.get(showRegistryOptions)) $$render(consequent);
																									});
																								}

																								$.append($$anchor, fragment_8);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_7);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_6);
																	},
																	$$slots: { default: true }
																}));
															});
														}

														$.append($$anchor, fragment_5);
													};

													HoverCardTrigger(node_3, { child, $$slots: { child: true } });
												}

												var node_15 = $.sibling(node_3, 2);

												HoverCardContent(node_15, {
													class: 'w-fit px-3 py-1.5',
													children: ($$anchor, $$slotProps) => {
														var p = root_2();
														var text = $.only_child(p, true);

														$.template_effect(() => $.set_text(text, $.get(installUrl)));
														$.append($$anchor, p);
													},
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(installUrl)) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}