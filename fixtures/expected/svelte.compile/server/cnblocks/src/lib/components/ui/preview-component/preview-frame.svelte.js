import * as $ from 'svelte/internal/server';
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

export default function Preview_frame($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			componentName,
			addItem,
			installUrl,
			installUrlBase = "https://sv-blocks.vercel.app",
			installCommand,
			registryOptions = ["@sv/cnblocks"],
			registry,
			agent = "pnpm",
			code,
			previewHref,
			openPreviewInNewTab = true,
			showFullscreenButton = Boolean(previewHref),
			themeSetupHref = "/docs/installation",
			themeSetupText = "Need theme tweaks? Follow the theme setup guide.",
			class: className = "",
			panelClass = ""
		} = $$props;

		let mode = "preview";
		let hasCode = $.derived(() => Boolean(code));
		let currentAgent = $.derived(() => agent);
		let currentRegistry = $.derived(() => registry ?? registryOptions[0] ?? "@sv/cnblocks");

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

		let resolvedAddItem = $.derived(() => addItem ?? getLegacyItemFromCommand(installCommand));
		let installPathname = $.derived(() => previewHref ?? page.url.pathname);
		const getInstallBase = (base) => base.replace(/\/+$/, "").replace(/\/(r|v|m)$/i, "");

		let resolvedInstallUrl = $.derived(() => installUrl ?? (resolvedAddItem()
			? getRegistryItemUrl(getInstallBase(installUrlBase), installPathname(), resolvedAddItem())
			: ""));

		let fullInstallCommand = $.derived(() => {
			if (!resolvedInstallUrl()) return "";

			const command = resolveCommand(currentAgent(), "execute", ["shadcn-svelte@latest", "add", resolvedInstallUrl()]);

			return command
				? `${command.command} ${command.args.join(" ")}`
				: `npx shadcn-svelte@latest add ${resolvedInstallUrl()}`;
		});

		let showRegistryOptions = $.derived(() => registryOptions.length > 1);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attr_class($.clsx(cn("mt-2 w-full", className)))} data-toc-ignore="">`);

			if (Frame.Root) {
				$$renderer.push('<!--[-->');

				Frame.Root($$renderer, {
					class: 'overflow-hidden',
					children: ($$renderer) => {
						if (Frame.Header) {
							$$renderer.push('<!--[-->');

							Frame.Header($$renderer, {
								class: 'px-3 py-1.5 sm:px-4',
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex flex-wrap items-center justify-between gap-2.5">`);

									if (Frame.Title) {
										$$renderer.push('<!--[-->');

										Frame.Title($$renderer, {
											class: 'truncate text-sm font-medium',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(componentName)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` <div class="flex items-center gap-1.5">`);

									if (hasCode()) {
										$$renderer.push(`<!--[0--><div class="inline-flex items-center gap-0.5 rounded-md border bg-muted/60 p-0.5">`);

										Button($$renderer, {
											variant: mode === "preview" ? "secondary" : "ghost",
											size: 'sm',
											class: 'h-7 px-2.5',
											onclick: () => mode = "preview",
											'aria-label': 'Show preview',
											children: ($$renderer) => {
												Eye($$renderer, { class: 'size-3.5' });
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Button($$renderer, {
											variant: mode === "code" ? "secondary" : "ghost",
											size: 'sm',
											class: 'h-7 px-2.5',
											onclick: () => mode = "code",
											'aria-label': 'Show code',
											children: ($$renderer) => {
												CodeXml($$renderer, { class: 'size-3.5' });
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if (resolvedInstallUrl()) {
										$$renderer.push('<!--[0-->');

										if (Add.Provider) {
											$$renderer.push('<!--[-->');

											Add.Provider($$renderer, {
												registryOptions,
												get agent() {
													return currentAgent();
												},

												set agent($$value) {
													currentAgent($$value);
													$$settled = false;
												},

												get registry() {
													return currentRegistry();
												},

												set registry($$value) {
													currentRegistry($$value);
													$$settled = false;
												},

												children: ($$renderer) => {
													if (Add.Root) {
														$$renderer.push('<!--[-->');

														Add.Root($$renderer, {
															item: resolvedInstallUrl(),
															withoutRegistry: true,
															children: ($$renderer) => {
																if (Add.Group) {
																	$$renderer.push('<!--[-->');

																	Add.Group($$renderer, {
																		class: 'h-8 w-88 max-w-full',
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
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if (previewHref && showFullscreenButton) {
										$$renderer.push('<!--[0-->');

										Button($$renderer, {
											variant: 'outline',
											size: 'sm',
											class: 'h-7 w-7 p-0',
											href: previewHref,
											target: openPreviewInNewTab ? "_blank" : undefined,
											rel: openPreviewInNewTab ? "noopener noreferrer" : undefined,
											'aria-label': 'Open fullscreen preview',
											children: ($$renderer) => {
												Maximize($$renderer, { class: 'size-3.5' });
											},
											$$slots: { default: true }
										});
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--></div></div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Frame.Panel) {
							$$renderer.push('<!--[-->');

							Frame.Panel($$renderer, {
								children: ($$renderer) => {
									if (mode === "preview" || !hasCode()) {
										$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(cn("min-h-64 w-full bg-background p-3 sm:p-4", panelClass)))}>`);

										if (children) {
											$$renderer.push('<!--[0-->');
											children?.($$renderer);
											$$renderer.push(`<!---->`);
										} else {
											$$renderer.push(`<!--[-1--><p class="text-sm leading-relaxed text-muted-foreground">No component provided. Please provide a component to render.</p>`);
										}

										$$renderer.push(`<!--]--></div>`);
									} else {
										$$renderer.push(`<!--[-1--><div class="bg-background p-3 sm:p-4">`);

										if (Array.isArray(code)) {
											$$renderer.push('<!--[0-->');
											MultipleCode($$renderer, { code });
										} else if (code) {
											$$renderer.push('<!--[1-->');
											SingleCodeFilename($$renderer, { code });
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--></div>`);
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

			$$renderer.push(`</div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}