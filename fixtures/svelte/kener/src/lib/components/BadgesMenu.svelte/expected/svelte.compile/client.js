import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Dialog from "$lib/components/ui/dialog/index.js";
import CopyButton from "$lib/components/CopyButton.svelte";
import GC from "$lib/global-constants.js";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import { t } from "$lib/stores/i18n";
import trackEvent from "$lib/beacon";
import { Button } from "$lib/components/ui/button/index.js";
import TrendingUp from "@lucide/svelte/icons/trending-up";
import Percent from "@lucide/svelte/icons/percent";
import Timer from "@lucide/svelte/icons/timer";
import Copy from "@lucide/svelte/icons/copy";
import Sticker from "@lucide/svelte/icons/sticker";
import { page } from "$app/state";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center justify-between gap-2 rounded-3xl border px-2 py-1"><div class="flex items-center gap-2"><!> <span class="text-xs font-medium"> </span></div> <img alt="Status Badge" class="h-5"/> <!></div>`);
var root_2 = $.from_html(`<div class="flex items-center justify-between gap-2 rounded-3xl border px-2 py-1"><div class="flex items-center gap-2"><!> <span class="text-xs font-medium"> </span></div> <img alt="Uptime Badge" class="h-5"/> <!></div>`);
var root_3 = $.from_html(`<div class="flex items-center justify-between gap-2 rounded-3xl border px-2 py-1"><div class="flex items-center gap-2"><!> <span class="text-xs font-medium"> </span></div> <img alt="Avg Latency Badge" class="h-5"/> <!></div>`);
var root_4 = $.from_html(`<div class="flex items-center justify-between gap-2 rounded-3xl border px-2 py-1"><div class="flex items-center gap-2"><!> <span class="text-xs font-medium"> </span></div> <img alt="Max Latency Badge" class="h-5"/> <!></div>`);
var root_5 = $.from_html(`<div class="flex items-center justify-between gap-2 rounded-3xl border px-2 py-1"><div class="flex items-center gap-2"><!> <span class="text-xs font-medium"> </span></div> <img alt="Min Latency Badge" class="h-5"/> <!></div>`);
var root_6 = $.from_html(`<div class="flex items-center gap-2 rounded-3xl border px-2 py-1"><img alt="Status Dot" class="h-4"/> <span class="text-xs font-medium"> </span> <!></div>`);
var root_7 = $.from_html(`<div class="flex items-center gap-2 rounded-3xl border px-2 py-1"><img alt="Status Dot Ping" class="h-4"/> <span class="text-xs font-medium"> </span> <!></div>`);
var root_8 = $.from_html(`<!> <div class="flex flex-col gap-6"><div><h3 class="mb-2 text-sm font-semibold"> </h3> <div class="flex flex-col gap-2"><!> <!> <!> <!> <!></div></div> <div><h3 class="mb-2 text-sm font-semibold"> </h3> <div class="flex flex-row gap-2"><!> <!></div></div></div>`, 1);

export default function BadgesMenu($$anchor, $$props) {
	$.push($$props, true);

	const $t = () => $.store_get(t, '$t', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let open = $.state(false);
	let showMenu = $.derived(() => page.route.id === "/(kener)/monitors/[monitor_tag]" && !!page.params.monitor_tag && page.data.monitorSharingOptions?.showShareBadgeMonitor && page.data.subMenuOptions?.showShareBadgeMonitor);
	let monitorTag = page.params.monitor_tag;

	function handleBadgeCopy(type) {
		trackEvent("badge_copied", { type, monitorTag });
	}

	// Badge URLs
	const badgeStatusUrl = $.derived(() => $$props.protocol && $$props.domain
		? `${$$props.protocol}//${$$props.domain}` + clientResolver(resolve, `/badge/${monitorTag}/status`)
		: "");

	const badgeUptimeUrl = $.derived(() => $$props.protocol && $$props.domain
		? `${$$props.protocol}//${$$props.domain}` + clientResolver(resolve, `/badge/${monitorTag}/uptime`)
		: "");

	const badgeLatencyAvgUrl = $.derived(() => $$props.protocol && $$props.domain
		? `${$$props.protocol}//${$$props.domain}` + clientResolver(resolve, `/badge/${monitorTag}/latency`)
		: "");

	const badgeLatencyMaxUrl = $.derived(() => $$props.protocol && $$props.domain
		? `${$$props.protocol}//${$$props.domain}` + clientResolver(resolve, `/badge/${monitorTag}/latency?metric=maximum`)
		: "");

	const badgeLatencyMinUrl = $.derived(() => $$props.protocol && $$props.domain
		? `${$$props.protocol}//${$$props.domain}` + clientResolver(resolve, `/badge/${monitorTag}/latency?metric=minimum`)
		: "");

	const badgeDotUrl = $.derived(() => $$props.protocol && $$props.domain
		? `${$$props.protocol}//${$$props.domain}` + clientResolver(resolve, `/badge/${monitorTag}/dot`)
		: "");

	const badgeDotPingUrl = $.derived(() => $$props.protocol && $$props.domain
		? `${$$props.protocol}//${$$props.domain}` + clientResolver(resolve, `/badge/${monitorTag}/dot?animate=ping`)
		: "");

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
					trackEvent("badges_menu_opened", { source: "theme_plus" });
				},

				children: ($$anchor, $$slotProps) => {
					Sticker($$anchor, {});
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
						class: 'max-w-md rounded-3xl',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_8();
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

													$.template_effect(($0) => $.set_text(text, $0), [() => $t()("Badges")]);
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

													$.template_effect(($0) => $.set_text(text_1, $0), [() => $t()("Get badges for this monitor")]);
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
							var h3 = $.child(div_1);
							var text_2 = $.only_child(h3, true);
							var div_2 = $.sibling(h3, 2);
							var node_7 = $.child(div_2);

							{
								var consequent_1 = ($$anchor) => {
									var div_3 = root_1();
									var div_4 = $.child(div_3);
									var node_8 = $.child(div_4);

									TrendingUp(node_8, { class: 'h-3 w-3' });

									var span = $.sibling(node_8, 2);
									var text_3 = $.only_child(span, true);

									$.reset(div_4);

									var img = $.sibling(div_4, 2);
									var node_9 = $.sibling(img, 2);

									CopyButton(node_9, {
										variant: 'ghost',
										size: 'icon-sm',
										get text() {
											return $.get(badgeStatusUrl);
										},
										class: 'rounded-btn',
										onclick: () => handleBadgeCopy("status"),
										children: ($$anchor, $$slotProps) => {
											Copy($$anchor, {});
										},
										$$slots: { default: true }
									});

									$.reset(div_3);

									$.template_effect(
										($0) => {
											$.set_text(text_3, $0);
											$.set_attribute(img, 'src', $.get(badgeStatusUrl));
										},
										[() => $t()("Status Badge")]
									);

									$.append($$anchor, div_3);
								};

								$.if(node_7, ($$render) => {
									if ($.get(badgeStatusUrl)) $$render(consequent_1);
								});
							}

							var node_10 = $.sibling(node_7, 2);

							{
								var consequent_2 = ($$anchor) => {
									var div_5 = root_2();
									var div_6 = $.child(div_5);
									var node_11 = $.child(div_6);

									Percent(node_11, { class: 'h-3 w-3' });

									var span_1 = $.sibling(node_11, 2);
									var text_4 = $.only_child(span_1, true);

									$.reset(div_6);

									var img_1 = $.sibling(div_6, 2);
									var node_12 = $.sibling(img_1, 2);

									CopyButton(node_12, {
										variant: 'ghost',
										size: 'icon-sm',
										get text() {
											return $.get(badgeUptimeUrl);
										},
										class: 'rounded-btn hover:bg-transparent',
										onclick: () => handleBadgeCopy("uptime"),
										children: ($$anchor, $$slotProps) => {
											Copy($$anchor, {});
										},
										$$slots: { default: true }
									});

									$.reset(div_5);

									$.template_effect(
										($0) => {
											$.set_text(text_4, $0);
											$.set_attribute(img_1, 'src', $.get(badgeUptimeUrl));
										},
										[() => $t()("Uptime Badge")]
									);

									$.append($$anchor, div_5);
								};

								$.if(node_10, ($$render) => {
									if ($.get(badgeUptimeUrl)) $$render(consequent_2);
								});
							}

							var node_13 = $.sibling(node_10, 2);

							{
								var consequent_3 = ($$anchor) => {
									var div_7 = root_3();
									var div_8 = $.child(div_7);
									var node_14 = $.child(div_8);

									Timer(node_14, { class: 'h-3 w-3' });

									var span_2 = $.sibling(node_14, 2);
									var text_5 = $.only_child(span_2, true);

									$.reset(div_8);

									var img_2 = $.sibling(div_8, 2);
									var node_15 = $.sibling(img_2, 2);

									CopyButton(node_15, {
										variant: 'ghost',
										size: 'icon-sm',
										get text() {
											return $.get(badgeLatencyAvgUrl);
										},
										class: 'rounded-btn',
										onclick: () => handleBadgeCopy("latency_avg"),
										children: ($$anchor, $$slotProps) => {
											Copy($$anchor, {});
										},
										$$slots: { default: true }
									});

									$.reset(div_7);

									$.template_effect(
										($0) => {
											$.set_text(text_5, $0);
											$.set_attribute(img_2, 'src', $.get(badgeLatencyAvgUrl));
										},
										[() => $t()("Avg Latency")]
									);

									$.append($$anchor, div_7);
								};

								$.if(node_13, ($$render) => {
									if ($.get(badgeLatencyAvgUrl)) $$render(consequent_3);
								});
							}

							var node_16 = $.sibling(node_13, 2);

							{
								var consequent_4 = ($$anchor) => {
									var div_9 = root_4();
									var div_10 = $.child(div_9);
									var node_17 = $.child(div_10);

									Timer(node_17, { class: 'h-3 w-3' });

									var span_3 = $.sibling(node_17, 2);
									var text_6 = $.only_child(span_3, true);

									$.reset(div_10);

									var img_3 = $.sibling(div_10, 2);
									var node_18 = $.sibling(img_3, 2);

									CopyButton(node_18, {
										variant: 'ghost',
										size: 'icon-sm',
										get text() {
											return $.get(badgeLatencyMaxUrl);
										},
										class: 'rounded-btn',
										onclick: () => handleBadgeCopy("latency_max"),
										children: ($$anchor, $$slotProps) => {
											Copy($$anchor, {});
										},
										$$slots: { default: true }
									});

									$.reset(div_9);

									$.template_effect(
										($0) => {
											$.set_text(text_6, $0);
											$.set_attribute(img_3, 'src', $.get(badgeLatencyMaxUrl));
										},
										[() => $t()("Max Latency")]
									);

									$.append($$anchor, div_9);
								};

								$.if(node_16, ($$render) => {
									if ($.get(badgeLatencyMaxUrl)) $$render(consequent_4);
								});
							}

							var node_19 = $.sibling(node_16, 2);

							{
								var consequent_5 = ($$anchor) => {
									var div_11 = root_5();
									var div_12 = $.child(div_11);
									var node_20 = $.child(div_12);

									Timer(node_20, { class: 'h-3 w-3' });

									var span_4 = $.sibling(node_20, 2);
									var text_7 = $.only_child(span_4, true);

									$.reset(div_12);

									var img_4 = $.sibling(div_12, 2);
									var node_21 = $.sibling(img_4, 2);

									CopyButton(node_21, {
										variant: 'ghost',
										size: 'icon-sm',
										get text() {
											return $.get(badgeLatencyMinUrl);
										},
										class: 'rounded-btn',
										onclick: () => handleBadgeCopy("latency_min"),
										children: ($$anchor, $$slotProps) => {
											Copy($$anchor, {});
										},
										$$slots: { default: true }
									});

									$.reset(div_11);

									$.template_effect(
										($0) => {
											$.set_text(text_7, $0);
											$.set_attribute(img_4, 'src', $.get(badgeLatencyMinUrl));
										},
										[() => $t()("Min Latency")]
									);

									$.append($$anchor, div_11);
								};

								$.if(node_19, ($$render) => {
									if ($.get(badgeLatencyMinUrl)) $$render(consequent_5);
								});
							}

							$.reset(div_2);
							$.reset(div_1);

							var div_13 = $.sibling(div_1, 2);
							var h3_1 = $.child(div_13);
							var text_8 = $.only_child(h3_1, true);
							var div_14 = $.sibling(h3_1, 2);
							var node_22 = $.child(div_14);

							{
								var consequent_6 = ($$anchor) => {
									var div_15 = root_6();
									var img_5 = $.child(div_15);
									var span_5 = $.sibling(img_5, 2);
									var text_9 = $.only_child(span_5, true);
									var node_23 = $.sibling(span_5, 2);

									CopyButton(node_23, {
										variant: 'ghost',
										size: 'icon-sm',
										get text() {
											return $.get(badgeDotUrl);
										},
										class: 'rounded-btn',
										onclick: () => handleBadgeCopy("dot"),
										children: ($$anchor, $$slotProps) => {
											Copy($$anchor, {});
										},
										$$slots: { default: true }
									});

									$.reset(div_15);

									$.template_effect(
										($0) => {
											$.set_attribute(img_5, 'src', $.get(badgeDotUrl));
											$.set_text(text_9, $0);
										},
										[() => $t()("Standard")]
									);

									$.append($$anchor, div_15);
								};

								$.if(node_22, ($$render) => {
									if ($.get(badgeDotUrl)) $$render(consequent_6);
								});
							}

							var node_24 = $.sibling(node_22, 2);

							{
								var consequent_7 = ($$anchor) => {
									var div_16 = root_7();
									var img_6 = $.child(div_16);
									var span_6 = $.sibling(img_6, 2);
									var text_10 = $.only_child(span_6, true);
									var node_25 = $.sibling(span_6, 2);

									CopyButton(node_25, {
										variant: 'ghost',
										size: 'icon-sm',
										get text() {
											return $.get(badgeDotPingUrl);
										},
										class: 'rounded-btn',
										onclick: () => handleBadgeCopy("dot_ping"),
										children: ($$anchor, $$slotProps) => {
											Copy($$anchor, {});
										},
										$$slots: { default: true }
									});

									$.reset(div_16);

									$.template_effect(
										($0) => {
											$.set_attribute(img_6, 'src', $.get(badgeDotPingUrl));
											$.set_text(text_10, $0);
										},
										[() => $t()("Pinging")]
									);

									$.append($$anchor, div_16);
								};

								$.if(node_24, ($$render) => {
									if ($.get(badgeDotPingUrl)) $$render(consequent_7);
								});
							}

							$.reset(div_14);
							$.reset(div_13);
							$.reset(div);

							$.template_effect(
								($0, $1) => {
									$.set_text(text_2, $0);
									$.set_text(text_8, $1);
								},
								[() => $t()("Badges"), () => $t()("Live Status")]
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