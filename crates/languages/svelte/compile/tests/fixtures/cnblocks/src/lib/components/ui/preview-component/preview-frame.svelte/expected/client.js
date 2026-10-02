import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import * as Frame from "$lib/components/ui/frame/index.js";
import { Button } from "$lib/components/ui/button";
import * as Add from "$lib/components/ui/add";
import { AGENTS } from "$lib/components/ui/add";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
import MultipleCode from "$lib/components/ui/code/multiple-code.svelte";
import SingleCodeFilename from "$lib/components/ui/code/single-code-filename.svelte";
import { resolveCommand } from "package-manager-detector/commands";
import { getRegistryItemUrl } from "$lib/utils/registry-url";
import { cn } from "$lib/utils";
import Eye from "@lucide/svelte/icons/eye";
import CodeXml from "@lucide/svelte/icons/code-xml";
import Maximize from "@lucide/svelte/icons/maximize";

var root = $.from_html(`<div class="inline-flex items-center gap-0.5 rounded-md border bg-muted/60 p-0.5"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="flex flex-wrap items-center justify-between gap-2.5"><!> <div class="flex items-center gap-1.5"><!> <!> <!></div></div>`);
var root_4 = $.from_html(`<p class="text-sm leading-relaxed text-muted-foreground">No component provided. Please provide a component to render.</p>`);
var root_5 = $.from_html(`<div><!></div>`);
var root_6 = $.from_html(`<div class="bg-background p-3 sm:p-4"><!></div>`);
var root_7 = $.from_html(`<div data-toc-ignore=""><!></div>`);

export default function Preview_frame($$anchor, $$props) {
	$.push($$props, true);

	let installUrlBase = $.prop($$props, 'installUrlBase', 3, "https://sv-blocks.vercel.app"),
		registryOptions = $.prop($$props, 'registryOptions', 19, () => ["@sv/cnblocks"]),
		agent = $.prop($$props, 'agent', 3, "pnpm"),
		openPreviewInNewTab = $.prop($$props, 'openPreviewInNewTab', 3, true),
		showFullscreenButton = $.prop($$props, 'showFullscreenButton', 19, () => Boolean($$props.previewHref)),
		themeSetupHref = $.prop($$props, 'themeSetupHref', 3, "/docs/installation"),
		themeSetupText = $.prop($$props, 'themeSetupText', 3, "Need theme tweaks? Follow the theme setup guide."),
		className = $.prop($$props, 'class', 3, ""),
		panelClass = $.prop($$props, 'panelClass', 3, "");

	let mode = $.state("preview");
	let hasCode = $.derived(() => Boolean($$props.code));
	let currentAgent = $.derived(agent);
	let currentRegistry = $.derived(() => $$props.registry ?? registryOptions()[0] ?? "@sv/cnblocks");

	const getLegacyItemFromCommand = (command) => {
		if (!command) return "";

		const tokens = command.trim().split(/\s+/);
		const target = tokens[tokens.length - 1] ?? "";

		if (target.startsWith("http")) {
			const file = target.split("/").pop() ?? target;

			return file.replace(/\.json$/, "");
		}

		if (target.includes("/")) {
			return target.split("/").pop() ?? target;
		}

		return target;
	};

	let resolvedAddItem = $.derived(() => $$props.addItem ?? getLegacyItemFromCommand($$props.installCommand));
	let installPathname = $.derived(() => $$props.previewHref ?? page.url.pathname);
	const getInstallBase = (base) => base.replace(/\/+$/, "").replace(/\/(r|v|m)$/i, "");

	let resolvedInstallUrl = $.derived(() => $$props.installUrl ?? ($.get(resolvedAddItem)
		? getRegistryItemUrl(getInstallBase(installUrlBase()), $.get(installPathname), $.get(resolvedAddItem))
		: ""));

	let fullInstallCommand = $.derived(() => {
		if (!$.get(resolvedInstallUrl)) return "";

		const command = resolveCommand($.get(currentAgent), "execute", ["shadcn-svelte@latest", "add", $.get(resolvedInstallUrl)]);

		return command
			? `${command.command} ${command.args.join(" ")}`
			: `npx shadcn-svelte@latest add ${$.get(resolvedInstallUrl)}`;
	});

	let showRegistryOptions = $.derived(() => registryOptions().length > 1);
	var div = root_7();
	var node = $.child(div);

	$.component(node, () => Frame.Root, ($$anchor, Frame_Root) => {
		Frame_Root($$anchor, {
			class: 'overflow-hidden',
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Frame.Header, ($$anchor, Frame_Header) => {
					Frame_Header($$anchor, {
						class: 'px-3 py-1.5 sm:px-4',
						children: ($$anchor, $$slotProps) => {
							var div_1 = root_3();
							var node_2 = $.child(div_1);

							$.component(node_2, () => Frame.Title, ($$anchor, Frame_Title) => {
								Frame_Title($$anchor, {
									class: 'truncate text-sm font-medium',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, $$props.componentName));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var div_2 = $.sibling(node_2, 2);
							var node_3 = $.child(div_2);

							{
								var consequent = ($$anchor) => {
									var div_3 = root();
									var node_4 = $.child(div_3);

									{
										let $0 = $.derived(() => $.get(mode) === "preview" ? "secondary" : "ghost");

										Button(node_4, {
											get variant() {
												return $.get($0);
											},
											size: 'sm',
											class: 'h-7 px-2.5',
											onclick: () => $.set(mode, "preview"),
											'aria-label': 'Show preview',
											children: ($$anchor, $$slotProps) => {
												Eye($$anchor, { class: 'size-3.5' });
											},
											$$slots: { default: true }
										});
									}

									var node_5 = $.sibling(node_4, 2);

									{
										let $0 = $.derived(() => $.get(mode) === "code" ? "secondary" : "ghost");

										Button(node_5, {
											get variant() {
												return $.get($0);
											},
											size: 'sm',
											class: 'h-7 px-2.5',
											onclick: () => $.set(mode, "code"),
											'aria-label': 'Show code',
											children: ($$anchor, $$slotProps) => {
												CodeXml($$anchor, { class: 'size-3.5' });
											},
											$$slots: { default: true }
										});
									}

									$.reset(div_3);
									$.append($$anchor, div_3);
								};

								$.if(node_3, ($$render) => {
									if ($.get(hasCode)) $$render(consequent);
								});
							}

							var node_6 = $.sibling(node_3, 2);

							{
								var consequent_2 = ($$anchor) => {
									var fragment_4 = $.comment();
									var node_7 = $.first_child(fragment_4);

									$.component(node_7, () => Add.Provider, ($$anchor, Add_Provider) => {
										Add_Provider($$anchor, {
											get registryOptions() {
												return registryOptions();
											},

											get agent() {
												return $.get(currentAgent);
											},

											set agent($$value) {
												$.set(currentAgent, $$value);
											},

											get registry() {
												return $.get(currentRegistry);
											},

											set registry($$value) {
												$.set(currentRegistry, $$value);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_5 = $.comment();
												var node_8 = $.first_child(fragment_5);

												$.component(node_8, () => Add.Root, ($$anchor, Add_Root) => {
													Add_Root($$anchor, {
														get item() {
															return $.get(resolvedInstallUrl);
														},
														withoutRegistry: true,
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = $.comment();
															var node_9 = $.first_child(fragment_6);

															$.component(node_9, () => Add.Group, ($$anchor, Add_Group) => {
																Add_Group($$anchor, {
																	class: 'h-8 w-88 max-w-full',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_7 = root_2();
																		var node_10 = $.first_child(fragment_7);

																		$.component(node_10, () => Add.Button, ($$anchor, Add_Button) => {
																			Add_Button($$anchor, { class: 'h-8 min-w-0 md:pr-2 md:pl-2 [&>div]:size-8' });
																		});

																		var node_11 = $.sibling(node_10, 2);

																		$.component(node_11, () => Add.GroupSeparator, ($$anchor, Add_GroupSeparator) => {
																			Add_GroupSeparator($$anchor, { class: 'h-4' });
																		});

																		var node_12 = $.sibling(node_11, 2);

																		$.component(node_12, () => Add.Dropdown, ($$anchor, Add_Dropdown) => {
																			Add_Dropdown($$anchor, {
																				class: 'size-8',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_8 = $.comment();
																					var node_13 = $.first_child(fragment_8);

																					$.component(node_13, () => Add.DropdownContent, ($$anchor, Add_DropdownContent) => {
																						Add_DropdownContent($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_9 = root_1();
																								var node_14 = $.first_child(fragment_9);

																								$.each(node_14, 16, () => AGENTS, (addAgent) => addAgent, ($$anchor, addAgent) => {
																									var fragment_10 = $.comment();
																									var node_15 = $.first_child(fragment_10);

																									$.component(node_15, () => Add.DropdownAgentOption, ($$anchor, Add_DropdownAgentOption) => {
																										Add_DropdownAgentOption($$anchor, {
																											get agent() {
																												return addAgent;
																											}
																										});
																									});

																									$.append($$anchor, fragment_10);
																								});

																								var node_16 = $.sibling(node_14, 2);

																								{
																									var consequent_1 = ($$anchor) => {
																										var fragment_11 = root_1();
																										var node_17 = $.first_child(fragment_11);

																										$.component(node_17, () => Add.DropdownSeparator, ($$anchor, Add_DropdownSeparator) => {
																											Add_DropdownSeparator($$anchor, {});
																										});

																										var node_18 = $.sibling(node_17, 2);

																										$.each(node_18, 16, registryOptions, (option) => option, ($$anchor, option) => {
																											var fragment_12 = $.comment();
																											var node_19 = $.first_child(fragment_12);

																											$.component(node_19, () => Add.DropdownRegistryOption, ($$anchor, Add_DropdownRegistryOption) => {
																												Add_DropdownRegistryOption($$anchor, {
																													get registry() {
																														return option;
																													}
																												});
																											});

																											$.append($$anchor, fragment_12);
																										});

																										$.append($$anchor, fragment_11);
																									};

																									$.if(node_16, ($$render) => {
																										if ($.get(showRegistryOptions)) $$render(consequent_1);
																									});
																								}

																								$.append($$anchor, fragment_9);
																							},
																							$$slots: { default: true }
																						});
																					});

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
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								};

								$.if(node_6, ($$render) => {
									if ($.get(resolvedInstallUrl)) $$render(consequent_2);
								});
							}

							var node_20 = $.sibling(node_6, 2);

							{
								var consequent_3 = ($$anchor) => {
									{
										let $0 = $.derived(() => openPreviewInNewTab() ? "_blank" : undefined);
										let $1 = $.derived(() => openPreviewInNewTab() ? "noopener noreferrer" : undefined);

										Button($$anchor, {
											variant: 'outline',
											size: 'sm',
											class: 'h-7 w-7 p-0',
											get href() {
												return $$props.previewHref;
											},

											get target() {
												return $.get($0);
											},

											get rel() {
												return $.get($1);
											},
											'aria-label': 'Open fullscreen preview',
											children: ($$anchor, $$slotProps) => {
												Maximize($$anchor, { class: 'size-3.5' });
											},
											$$slots: { default: true }
										});
									}
								};

								$.if(node_20, ($$render) => {
									if ($$props.previewHref && showFullscreenButton()) $$render(consequent_3);
								});
							}

							$.reset(div_2);
							$.reset(div_1);
							$.append($$anchor, div_1);
						},
						$$slots: { default: true }
					});
				});

				var node_21 = $.sibling(node_1, 2);

				$.component(node_21, () => Frame.Panel, ($$anchor, Frame_Panel) => {
					Frame_Panel($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_15 = $.comment();
							var node_22 = $.first_child(fragment_15);

							{
								var consequent_5 = ($$anchor) => {
									var div_4 = root_5();
									var node_23 = $.child(div_4);

									{
										var consequent_4 = ($$anchor) => {
											var fragment_16 = $.comment();
											var node_24 = $.first_child(fragment_16);

											$.snippet(node_24, () => $$props.children ?? $.noop);
											$.append($$anchor, fragment_16);
										};

										var alternate = ($$anchor) => {
											var p = root_4();

											$.append($$anchor, p);
										};

										$.if(node_23, ($$render) => {
											if ($$props.children) $$render(consequent_4); else $$render(alternate, -1);
										});
									}

									$.reset(div_4);

									$.template_effect(($0) => $.set_class(div_4, 1, $0), [
										() => $.clsx(cn("min-h-64 w-full bg-background p-3 sm:p-4", panelClass()))
									]);

									$.append($$anchor, div_4);
								};

								var alternate_1 = ($$anchor) => {
									var div_5 = root_6();
									var node_25 = $.child(div_5);

									{
										var consequent_6 = ($$anchor) => {
											MultipleCode($$anchor, {
												get code() {
													return $$props.code;
												}
											});
										};

										var d = $.derived(() => Array.isArray($$props.code));

										var consequent_7 = ($$anchor) => {
											SingleCodeFilename($$anchor, {
												get code() {
													return $$props.code;
												}
											});
										};

										$.if(node_25, ($$render) => {
											if ($.get(d)) $$render(consequent_6); else if ($$props.code) $$render(consequent_7, 1);
										});
									}

									$.reset(div_5);
									$.append($$anchor, div_5);
								};

								$.if(node_22, ($$render) => {
									if ($.get(mode) === "preview" || !$.get(hasCode)) $$render(consequent_5); else $$render(alternate_1, -1);
								});
							}

							$.append($$anchor, fragment_15);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.template_effect(($0) => $.set_class(div, 1, $0), [() => $.clsx(cn("mt-2 w-full", className()))]);
	$.append($$anchor, div);
	$.pop();
}