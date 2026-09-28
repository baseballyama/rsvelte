import * as $ from 'svelte/internal/server';
import * as Dialog from "$lib/components/ui/dialog/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
import CopyButton from "$lib/components/CopyButton.svelte";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import { t } from "$lib/stores/i18n";
import { mode } from "mode-watcher";
import trackEvent from "$lib/beacon";
import { page } from "$app/state";
import Copy from "@lucide/svelte/icons/clipboard";
import Check from "@lucide/svelte/icons/check";
import Code from "@lucide/svelte/icons/code";

export default function EmbedMenu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { protocol, domain } = $$props;
		let open = false;
		let showMenu = $.derived(() => page.route.id === "/(kener)/monitors/[monitor_tag]" && !!page.params.monitor_tag && page.data.monitorSharingOptions?.showShareEmbedMonitor && page.data.subMenuOptions?.showShareEmbedMonitor);
		let monitorTag = page.params.monitor_tag;
		let monitorTheme = mode.current === "dark" ? "dark" : "light";
		let monitorEmbedType = "iframe";
		let latencyTheme = mode.current === "dark" ? "dark" : "light";
		let latencyEmbedType = "iframe";

		function setMonitorTheme(theme) {
			monitorTheme = theme;
			trackEvent("embed_theme_changed", { target: "monitor", theme, monitorTag });
		}

		function setMonitorEmbedType(type) {
			monitorEmbedType = type;
			trackEvent("embed_format_changed", { target: "monitor", format: type, monitorTag });
		}

		function setLatencyTheme(theme) {
			latencyTheme = theme;
			trackEvent("embed_theme_changed", { target: "latency", theme, monitorTag });
		}

		function setLatencyEmbedType(type) {
			latencyEmbedType = type;
			trackEvent("embed_format_changed", { target: "latency", format: type, monitorTag });
		}

		function handleEmbedCopy(target) {
			const theme = target === "monitor" ? monitorTheme : latencyTheme;
			const format = target === "monitor" ? monitorEmbedType : latencyEmbedType;

			trackEvent("embed_code_copied", { target, theme, format, monitorTag });
		}

		// Monitor Embed URL
		const monitorEmbedUrl = $.derived(() => () => {
			if (!protocol || !domain) return "";

			return `${protocol}//${domain}` + clientResolver(resolve, `/embed/monitor-${monitorTag}`);
		});

		// Monitor Preview URL
		const monitorPreviewUrl = $.derived(() => () => {
			const url = monitorEmbedUrl()();

			if (!url) return "";

			return `${url}`;
		});

		// Monitor Embed code
		const monitorEmbedCode = $.derived(() => () => {
			if (!protocol || !domain) return "";

			const url = monitorEmbedUrl()();
			const fullUrl = `${url}?theme=${monitorTheme}`;

			if (monitorEmbedType === "iframe") {
				return `<iframe src="${fullUrl}" width="100%" height="200" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0"></iframe>`;
			}

			return `<script src="${url}/js?theme=${monitorTheme}&monitor=${url}"><` + "/script>";
		});

		// Latency Embed URL
		const latencyEmbedUrl = $.derived(() => () => {
			if (!protocol || !domain) return "";

			return `${protocol}//${domain}` + clientResolver(resolve, `/embed/latency-${monitorTag}`);
		});

		// Latency Preview URL
		const latencyPreviewUrl = $.derived(() => () => {
			const url = latencyEmbedUrl()();

			if (!url) return "";

			return `${url}`;
		});

		// Latency Embed code
		const latencyEmbedCode = $.derived(() => () => {
			if (!protocol || !domain) return "";

			const url = latencyEmbedUrl()();
			const fullUrl = `${url}?theme=${latencyTheme}`;

			if (latencyEmbedType === "iframe") {
				return `<iframe src="${fullUrl}" width="100%" height="200" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0"></iframe>`;
			}

			return `<script src="${url}/js?theme=${latencyTheme}&monitor=${url}"><` + "/script>";
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (showMenu()) {
				$$renderer.push('<!--[0-->');

				Button($$renderer, {
					variant: 'outline',
					class: 'bg-background/80 dark:bg-background/70 border-foreground/10 relative cursor-pointer rounded-full border shadow-none backdrop-blur-md',
					size: 'icon-sm',
					onclick: () => {
						open = true;
						trackEvent("embed_menu_opened", { source: "theme_plus" });
					},

					children: ($$renderer) => {
						Code($$renderer, {});
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Overlay) {
							$$renderer.push('<!--[-->');
							Dialog.Overlay($$renderer, { class: 'backdrop-blur-[2px]' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'max-w-2xl rounded-3xl',
								children: ($$renderer) => {
									if (Dialog.Header) {
										$$renderer.push('<!--[-->');

										Dialog.Header($$renderer, {
											children: ($$renderer) => {
												if (Dialog.Title) {
													$$renderer.push('<!--[-->');

													Dialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Embed Monitor"))}`);
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
															$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Embed this monitor in your website or app"))}`);
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

									$$renderer.push(` <div class="flex flex-col gap-4"><div>`);

									Label($$renderer, {
										class: 'mb-2 block text-sm font-semibold',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Status Embed"))}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <div class="flex flex-col gap-3 rounded-3xl border p-4"><iframe title="status embed preview"${$.attr('src', monitorPreviewUrl()())} width="100%" height="70" frameborder="0"></iframe> <div class="flex flex-wrap items-center justify-between gap-3"><div class="flex flex-wrap items-center gap-3"><div class="flex items-center gap-2">`);

									if (ButtonGroup.Root) {
										$$renderer.push('<!--[-->');

										ButtonGroup.Root($$renderer, {
											class: 'rounded-btn-grp',
											children: ($$renderer) => {
												Button($$renderer, {
													variant: 'outline',
													size: 'sm',
													onclick: () => setMonitorTheme("light"),
													children: ($$renderer) => {
														if (monitorTheme === "light") {
															$$renderer.push('<!--[0-->');
															Check($$renderer, { class: 'text-accent-foreground h-3 w-3' });
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]--> ${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Light"))}`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													variant: 'outline',
													size: 'sm',
													onclick: () => setMonitorTheme("dark"),
													children: ($$renderer) => {
														if (monitorTheme === "dark") {
															$$renderer.push('<!--[0-->');
															Check($$renderer, { class: 'text-accent-foreground h-3 w-3' });
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]--> ${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Dark"))}`);
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

									$$renderer.push(`</div> <div class="flex items-center gap-2">`);

									if (ButtonGroup.Root) {
										$$renderer.push('<!--[-->');

										ButtonGroup.Root($$renderer, {
											class: 'rounded-btn-grp',
											children: ($$renderer) => {
												Button($$renderer, {
													variant: 'outline',
													size: 'sm',
													onclick: () => setMonitorEmbedType("iframe"),
													children: ($$renderer) => {
														if (monitorEmbedType === "iframe") {
															$$renderer.push('<!--[0-->');
															Check($$renderer, { class: 'text-accent-foreground h-3 w-3' });
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]--> ${$.escape($.store_get($$store_subs ??= {}, '$t', t)("iFrame"))}`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													variant: 'outline',
													size: 'sm',
													onclick: () => setMonitorEmbedType("script"),
													children: ($$renderer) => {
														if (monitorEmbedType === "script") {
															$$renderer.push('<!--[0-->');
															Check($$renderer, { class: 'text-accent-foreground h-3 w-3' });
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]--> ${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Script"))}`);
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

									$$renderer.push(`</div></div> `);

									CopyButton($$renderer, {
										variant: 'outline',
										class: 'rounded-btn',
										size: 'icon-sm',
										text: monitorEmbedCode()(),
										onclick: () => handleEmbedCopy("monitor"),
										children: ($$renderer) => {
											Copy($$renderer, {});
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div></div></div> <div>`);

									Label($$renderer, {
										class: 'mb-2 block text-sm font-semibold',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Latency Embed"))}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <div class="flex flex-col gap-3 rounded-3xl border p-4"><iframe title="latency embed preview"${$.attr('src', latencyPreviewUrl()())} width="100%" height="200" frameborder="0"></iframe> <div class="flex flex-wrap items-center justify-between gap-3"><div class="flex flex-wrap items-center gap-3"><div class="flex items-center gap-2">`);

									if (ButtonGroup.Root) {
										$$renderer.push('<!--[-->');

										ButtonGroup.Root($$renderer, {
											class: 'rounded-btn-grp',
											children: ($$renderer) => {
												Button($$renderer, {
													variant: 'outline',
													size: 'sm',
													onclick: () => setLatencyTheme("light"),
													children: ($$renderer) => {
														if (latencyTheme === "light") {
															$$renderer.push('<!--[0-->');
															Check($$renderer, { class: 'text-accent-foreground h-3 w-3' });
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]--> ${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Light"))}`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													variant: 'outline',
													size: 'sm',
													onclick: () => setLatencyTheme("dark"),
													children: ($$renderer) => {
														if (latencyTheme === "dark") {
															$$renderer.push('<!--[0-->');
															Check($$renderer, { class: 'text-accent-foreground h-3 w-3' });
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]--> ${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Dark"))}`);
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

									$$renderer.push(`</div> <div class="flex items-center gap-2">`);

									if (ButtonGroup.Root) {
										$$renderer.push('<!--[-->');

										ButtonGroup.Root($$renderer, {
											class: 'rounded-btn-grp',
											children: ($$renderer) => {
												Button($$renderer, {
													variant: 'outline',
													size: 'sm',
													onclick: () => setLatencyEmbedType("iframe"),
													children: ($$renderer) => {
														if (latencyEmbedType === "iframe") {
															$$renderer.push('<!--[0-->');
															Check($$renderer, { class: 'text-accent-foreground h-3 w-3' });
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]--> ${$.escape($.store_get($$store_subs ??= {}, '$t', t)("iFrame"))}`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													variant: 'outline',
													size: 'sm',
													onclick: () => setLatencyEmbedType("script"),
													children: ($$renderer) => {
														if (latencyEmbedType === "script") {
															$$renderer.push('<!--[0-->');
															Check($$renderer, { class: 'text-accent-foreground h-3 w-3' });
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]--> ${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Script"))}`);
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

									$$renderer.push(`</div></div> `);

									CopyButton($$renderer, {
										variant: 'outline',
										class: 'rounded-btn',
										size: 'icon-sm',
										text: latencyEmbedCode()(),
										onclick: () => handleEmbedCopy("latency"),
										children: ($$renderer) => {
											Copy($$renderer, {});
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div></div></div></div>`);
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}