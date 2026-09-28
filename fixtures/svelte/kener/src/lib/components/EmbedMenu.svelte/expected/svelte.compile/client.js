import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> `, 1);
var root_2 = $.from_html(`<!> <div class="flex flex-col gap-4"><div><!> <div class="flex flex-col gap-3 rounded-3xl border p-4"><iframe title="status embed preview" width="100%" height="70" frameborder="0"></iframe> <div class="flex flex-wrap items-center justify-between gap-3"><div class="flex flex-wrap items-center gap-3"><div class="flex items-center gap-2"><!></div> <div class="flex items-center gap-2"><!></div></div> <!></div></div></div> <div><!> <div class="flex flex-col gap-3 rounded-3xl border p-4"><iframe title="latency embed preview" width="100%" height="200" frameborder="0"></iframe> <div class="flex flex-wrap items-center justify-between gap-3"><div class="flex flex-wrap items-center gap-3"><div class="flex items-center gap-2"><!></div> <div class="flex items-center gap-2"><!></div></div> <!></div></div></div></div>`, 1);

export default function EmbedMenu($$anchor, $$props) {
	$.push($$props, true);

	const $t = () => $.store_get(t, '$t', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let open = $.state(false);
	let showMenu = $.derived(() => page.route.id === "/(kener)/monitors/[monitor_tag]" && !!page.params.monitor_tag && page.data.monitorSharingOptions?.showShareEmbedMonitor && page.data.subMenuOptions?.showShareEmbedMonitor);
	let monitorTag = page.params.monitor_tag;
	let monitorTheme = $.state($.proxy(mode.current === "dark" ? "dark" : "light"));
	let monitorEmbedType = $.state("iframe");
	let latencyTheme = $.state($.proxy(mode.current === "dark" ? "dark" : "light"));
	let latencyEmbedType = $.state("iframe");

	function setMonitorTheme(theme) {
		$.set(monitorTheme, theme, true);
		trackEvent("embed_theme_changed", { target: "monitor", theme, monitorTag });
	}

	function setMonitorEmbedType(type) {
		$.set(monitorEmbedType, type, true);
		trackEvent("embed_format_changed", { target: "monitor", format: type, monitorTag });
	}

	function setLatencyTheme(theme) {
		$.set(latencyTheme, theme, true);
		trackEvent("embed_theme_changed", { target: "latency", theme, monitorTag });
	}

	function setLatencyEmbedType(type) {
		$.set(latencyEmbedType, type, true);
		trackEvent("embed_format_changed", { target: "latency", format: type, monitorTag });
	}

	function handleEmbedCopy(target) {
		const theme = target === "monitor" ? $.get(monitorTheme) : $.get(latencyTheme);
		const format = target === "monitor" ? $.get(monitorEmbedType) : $.get(latencyEmbedType);

		trackEvent("embed_code_copied", { target, theme, format, monitorTag });
	}

	// Monitor Embed URL
	const monitorEmbedUrl = $.derived(() => () => {
		if (!$$props.protocol || !$$props.domain) return "";

		return `${$$props.protocol}//${$$props.domain}` + clientResolver(resolve, `/embed/monitor-${monitorTag}`);
	});

	// Monitor Preview URL
	const monitorPreviewUrl = $.derived(() => () => {
		const url = $.get(monitorEmbedUrl)();

		if (!url) return "";

		return `${url}`;
	});

	// Monitor Embed code
	const monitorEmbedCode = $.derived(() => () => {
		if (!$$props.protocol || !$$props.domain) return "";

		const url = $.get(monitorEmbedUrl)();
		const fullUrl = `${url}?theme=${$.get(monitorTheme)}`;

		if ($.get(monitorEmbedType) === "iframe") {
			return `<iframe src="${fullUrl}" width="100%" height="200" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0"></iframe>`;
		}

		return `<script src="${url}/js?theme=${$.get(monitorTheme)}&monitor=${url}"><` + "/script>";
	});

	// Latency Embed URL
	const latencyEmbedUrl = $.derived(() => () => {
		if (!$$props.protocol || !$$props.domain) return "";

		return `${$$props.protocol}//${$$props.domain}` + clientResolver(resolve, `/embed/latency-${monitorTag}`);
	});

	// Latency Preview URL
	const latencyPreviewUrl = $.derived(() => () => {
		const url = $.get(latencyEmbedUrl)();

		if (!url) return "";

		return `${url}`;
	});

	// Latency Embed code
	const latencyEmbedCode = $.derived(() => () => {
		if (!$$props.protocol || !$$props.domain) return "";

		const url = $.get(latencyEmbedUrl)();
		const fullUrl = `${url}?theme=${$.get(latencyTheme)}`;

		if ($.get(latencyEmbedType) === "iframe") {
			return `<iframe src="${fullUrl}" width="100%" height="200" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0"></iframe>`;
		}

		return `<script src="${url}/js?theme=${$.get(latencyTheme)}&monitor=${url}"><` + "/script>";
	});

	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Button($$anchor, {
				variant: 'outline',
				class: 'bg-background/80 dark:bg-background/70 border-foreground/10 relative cursor-pointer rounded-full border shadow-none backdrop-blur-md',
				size: 'icon-sm',
				onclick: () => {
					$.set(open, true);
					trackEvent("embed_menu_opened", { source: "theme_plus" });
				},

				children: ($$anchor, $$slotProps) => {
					Code($$anchor, {});
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if ($.get(showMenu)) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root();
				var node_2 = $.first_child(fragment_3);

				$.component(node_2, () => Dialog.Overlay, ($$anchor, Dialog_Overlay) => {
					Dialog_Overlay($$anchor, { class: 'backdrop-blur-[2px]' });
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'max-w-2xl rounded-3xl',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_2();
							var node_4 = $.first_child(fragment_4);

							$.component(node_4, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root();
										var node_5 = $.first_child(fragment_5);

										$.component(node_5, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text();

													$.template_effect(($0) => $.set_text(text, $0), [() => $t()("Embed Monitor")]);
													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text();

													$.template_effect(($0) => $.set_text(text_1, $0), [() => $t()("Embed this monitor in your website or app")]);
													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							var div = $.sibling(node_4, 2);
							var div_1 = $.child(div);
							var node_7 = $.child(div_1);

							Label(node_7, {
								class: 'mb-2 block text-sm font-semibold',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text();

									$.template_effect(($0) => $.set_text(text_2, $0), [() => $t()("Status Embed")]);
									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var div_2 = $.sibling(node_7, 2);
							var iframe = $.child(div_2);
							var div_3 = $.sibling(iframe, 2);
							var div_4 = $.child(div_3);
							var div_5 = $.child(div_4);
							var node_8 = $.child(div_5);

							$.component(node_8, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root) => {
								ButtonGroup_Root($$anchor, {
									class: 'rounded-btn-grp',
									children: ($$anchor, $$slotProps) => {
										var fragment_9 = root();
										var node_9 = $.first_child(fragment_9);

										Button(node_9, {
											variant: 'outline',
											size: 'sm',
											onclick: () => setMonitorTheme("light"),
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root_1();
												var node_10 = $.first_child(fragment_10);

												{
													var consequent_1 = ($$anchor) => {
														Check($$anchor, { class: 'text-accent-foreground h-3 w-3' });
													};

													$.if(node_10, ($$render) => {
														if ($.get(monitorTheme) === "light") $$render(consequent_1);
													});
												}

												var text_3 = $.sibling(node_10);

												$.template_effect(($0) => $.set_text(text_3, ` ${$0 ?? ''}`), [() => $t()("Light")]);
												$.append($$anchor, fragment_10);
											},
											$$slots: { default: true }
										});

										var node_11 = $.sibling(node_9, 2);

										Button(node_11, {
											variant: 'outline',
											size: 'sm',
											onclick: () => setMonitorTheme("dark"),
											children: ($$anchor, $$slotProps) => {
												var fragment_12 = root_1();
												var node_12 = $.first_child(fragment_12);

												{
													var consequent_2 = ($$anchor) => {
														Check($$anchor, { class: 'text-accent-foreground h-3 w-3' });
													};

													$.if(node_12, ($$render) => {
														if ($.get(monitorTheme) === "dark") $$render(consequent_2);
													});
												}

												var text_4 = $.sibling(node_12);

												$.template_effect(($0) => $.set_text(text_4, ` ${$0 ?? ''}`), [() => $t()("Dark")]);
												$.append($$anchor, fragment_12);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_9);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div_5);

							var div_6 = $.sibling(div_5, 2);
							var node_13 = $.child(div_6);

							$.component(node_13, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_1) => {
								ButtonGroup_Root_1($$anchor, {
									class: 'rounded-btn-grp',
									children: ($$anchor, $$slotProps) => {
										var fragment_14 = root();
										var node_14 = $.first_child(fragment_14);

										Button(node_14, {
											variant: 'outline',
											size: 'sm',
											onclick: () => setMonitorEmbedType("iframe"),
											children: ($$anchor, $$slotProps) => {
												var fragment_15 = root_1();
												var node_15 = $.first_child(fragment_15);

												{
													var consequent_3 = ($$anchor) => {
														Check($$anchor, { class: 'text-accent-foreground h-3 w-3' });
													};

													$.if(node_15, ($$render) => {
														if ($.get(monitorEmbedType) === "iframe") $$render(consequent_3);
													});
												}

												var text_5 = $.sibling(node_15);

												$.template_effect(($0) => $.set_text(text_5, ` ${$0 ?? ''}`), [() => $t()("iFrame")]);
												$.append($$anchor, fragment_15);
											},
											$$slots: { default: true }
										});

										var node_16 = $.sibling(node_14, 2);

										Button(node_16, {
											variant: 'outline',
											size: 'sm',
											onclick: () => setMonitorEmbedType("script"),
											children: ($$anchor, $$slotProps) => {
												var fragment_17 = root_1();
												var node_17 = $.first_child(fragment_17);

												{
													var consequent_4 = ($$anchor) => {
														Check($$anchor, { class: 'text-accent-foreground h-3 w-3' });
													};

													$.if(node_17, ($$render) => {
														if ($.get(monitorEmbedType) === "script") $$render(consequent_4);
													});
												}

												var text_6 = $.sibling(node_17);

												$.template_effect(($0) => $.set_text(text_6, ` ${$0 ?? ''}`), [() => $t()("Script")]);
												$.append($$anchor, fragment_17);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_14);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div_6);
							$.reset(div_4);

							var node_18 = $.sibling(div_4, 2);

							{
								let $0 = $.derived(() => $.get(monitorEmbedCode)());

								CopyButton(node_18, {
									variant: 'outline',
									class: 'rounded-btn',
									size: 'icon-sm',
									get text() {
										return $.get($0);
									},
									onclick: () => handleEmbedCopy("monitor"),
									children: ($$anchor, $$slotProps) => {
										Copy($$anchor, {});
									},
									$$slots: { default: true }
								});
							}

							$.reset(div_3);
							$.reset(div_2);
							$.reset(div_1);

							var div_7 = $.sibling(div_1, 2);
							var node_19 = $.child(div_7);

							Label(node_19, {
								class: 'mb-2 block text-sm font-semibold',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text();

									$.template_effect(($0) => $.set_text(text_7, $0), [() => $t()("Latency Embed")]);
									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});

							var div_8 = $.sibling(node_19, 2);
							var iframe_1 = $.child(div_8);
							var div_9 = $.sibling(iframe_1, 2);
							var div_10 = $.child(div_9);
							var div_11 = $.child(div_10);
							var node_20 = $.child(div_11);

							$.component(node_20, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_2) => {
								ButtonGroup_Root_2($$anchor, {
									class: 'rounded-btn-grp',
									children: ($$anchor, $$slotProps) => {
										var fragment_21 = root();
										var node_21 = $.first_child(fragment_21);

										Button(node_21, {
											variant: 'outline',
											size: 'sm',
											onclick: () => setLatencyTheme("light"),
											children: ($$anchor, $$slotProps) => {
												var fragment_22 = root_1();
												var node_22 = $.first_child(fragment_22);

												{
													var consequent_5 = ($$anchor) => {
														Check($$anchor, { class: 'text-accent-foreground h-3 w-3' });
													};

													$.if(node_22, ($$render) => {
														if ($.get(latencyTheme) === "light") $$render(consequent_5);
													});
												}

												var text_8 = $.sibling(node_22);

												$.template_effect(($0) => $.set_text(text_8, ` ${$0 ?? ''}`), [() => $t()("Light")]);
												$.append($$anchor, fragment_22);
											},
											$$slots: { default: true }
										});

										var node_23 = $.sibling(node_21, 2);

										Button(node_23, {
											variant: 'outline',
											size: 'sm',
											onclick: () => setLatencyTheme("dark"),
											children: ($$anchor, $$slotProps) => {
												var fragment_24 = root_1();
												var node_24 = $.first_child(fragment_24);

												{
													var consequent_6 = ($$anchor) => {
														Check($$anchor, { class: 'text-accent-foreground h-3 w-3' });
													};

													$.if(node_24, ($$render) => {
														if ($.get(latencyTheme) === "dark") $$render(consequent_6);
													});
												}

												var text_9 = $.sibling(node_24);

												$.template_effect(($0) => $.set_text(text_9, ` ${$0 ?? ''}`), [() => $t()("Dark")]);
												$.append($$anchor, fragment_24);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_21);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div_11);

							var div_12 = $.sibling(div_11, 2);
							var node_25 = $.child(div_12);

							$.component(node_25, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_3) => {
								ButtonGroup_Root_3($$anchor, {
									class: 'rounded-btn-grp',
									children: ($$anchor, $$slotProps) => {
										var fragment_26 = root();
										var node_26 = $.first_child(fragment_26);

										Button(node_26, {
											variant: 'outline',
											size: 'sm',
											onclick: () => setLatencyEmbedType("iframe"),
											children: ($$anchor, $$slotProps) => {
												var fragment_27 = root_1();
												var node_27 = $.first_child(fragment_27);

												{
													var consequent_7 = ($$anchor) => {
														Check($$anchor, { class: 'text-accent-foreground h-3 w-3' });
													};

													$.if(node_27, ($$render) => {
														if ($.get(latencyEmbedType) === "iframe") $$render(consequent_7);
													});
												}

												var text_10 = $.sibling(node_27);

												$.template_effect(($0) => $.set_text(text_10, ` ${$0 ?? ''}`), [() => $t()("iFrame")]);
												$.append($$anchor, fragment_27);
											},
											$$slots: { default: true }
										});

										var node_28 = $.sibling(node_26, 2);

										Button(node_28, {
											variant: 'outline',
											size: 'sm',
											onclick: () => setLatencyEmbedType("script"),
											children: ($$anchor, $$slotProps) => {
												var fragment_29 = root_1();
												var node_29 = $.first_child(fragment_29);

												{
													var consequent_8 = ($$anchor) => {
														Check($$anchor, { class: 'text-accent-foreground h-3 w-3' });
													};

													$.if(node_29, ($$render) => {
														if ($.get(latencyEmbedType) === "script") $$render(consequent_8);
													});
												}

												var text_11 = $.sibling(node_29);

												$.template_effect(($0) => $.set_text(text_11, ` ${$0 ?? ''}`), [() => $t()("Script")]);
												$.append($$anchor, fragment_29);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_26);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div_12);
							$.reset(div_10);

							var node_30 = $.sibling(div_10, 2);

							{
								let $0 = $.derived(() => $.get(latencyEmbedCode)());

								CopyButton(node_30, {
									variant: 'outline',
									class: 'rounded-btn',
									size: 'icon-sm',
									get text() {
										return $.get($0);
									},
									onclick: () => handleEmbedCopy("latency"),
									children: ($$anchor, $$slotProps) => {
										Copy($$anchor, {});
									},
									$$slots: { default: true }
								});
							}

							$.reset(div_9);
							$.reset(div_8);
							$.reset(div_7);
							$.reset(div);

							$.template_effect(
								($0, $1) => {
									$.set_attribute(iframe, 'src', $0);
									$.set_attribute(iframe_1, 'src', $1);
								},
								[
									() => $.get(monitorPreviewUrl)(),
									() => $.get(latencyPreviewUrl)()
								]
							);

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}