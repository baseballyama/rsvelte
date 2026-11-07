import * as $ from 'svelte/internal/server';
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

export default function BadgesMenu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { protocol, domain } = $$props;
		let open = false;
		let showMenu = $.derived(() => page.route.id === "/(kener)/monitors/[monitor_tag]" && !!page.params.monitor_tag && page.data.monitorSharingOptions?.showShareBadgeMonitor && page.data.subMenuOptions?.showShareBadgeMonitor);
		let monitorTag = page.params.monitor_tag;

		function handleBadgeCopy(type) {
			trackEvent("badge_copied", { type, monitorTag });
		}

		// Badge URLs
		const badgeStatusUrl = $.derived(() => protocol && domain
			? `${protocol}//${domain}` + clientResolver(resolve, `/badge/${monitorTag}/status`)
			: "");

		const badgeUptimeUrl = $.derived(() => protocol && domain
			? `${protocol}//${domain}` + clientResolver(resolve, `/badge/${monitorTag}/uptime`)
			: "");

		const badgeLatencyAvgUrl = $.derived(() => protocol && domain
			? `${protocol}//${domain}` + clientResolver(resolve, `/badge/${monitorTag}/latency`)
			: "");

		const badgeLatencyMaxUrl = $.derived(() => protocol && domain
			? `${protocol}//${domain}` + clientResolver(resolve, `/badge/${monitorTag}/latency?metric=maximum`)
			: "");

		const badgeLatencyMinUrl = $.derived(() => protocol && domain
			? `${protocol}//${domain}` + clientResolver(resolve, `/badge/${monitorTag}/latency?metric=minimum`)
			: "");

		const badgeDotUrl = $.derived(() => protocol && domain
			? `${protocol}//${domain}` + clientResolver(resolve, `/badge/${monitorTag}/dot`)
			: "");

		const badgeDotPingUrl = $.derived(() => protocol && domain
			? `${protocol}//${domain}` + clientResolver(resolve, `/badge/${monitorTag}/dot?animate=ping`)
			: "");

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
						trackEvent("badges_menu_opened", { source: "theme_plus" });
					},

					children: ($$renderer) => {
						Sticker($$renderer, {});
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
								class: 'max-w-md rounded-3xl',
								children: ($$renderer) => {
									if (Dialog.Header) {
										$$renderer.push('<!--[-->');

										Dialog.Header($$renderer, {
											children: ($$renderer) => {
												if (Dialog.Title) {
													$$renderer.push('<!--[-->');

													Dialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Badges"))}`);
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
															$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Get badges for this monitor"))}`);
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

									$$renderer.push(` <div class="flex flex-col gap-6"><div><h3 class="mb-2 text-sm font-semibold">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Badges"))}</h3> <div class="flex flex-col gap-2">`);

									if (badgeStatusUrl()) {
										$$renderer.push(`<!--[0--><div class="flex items-center justify-between gap-2 rounded-3xl border px-2 py-1"><div class="flex items-center gap-2">`);
										TrendingUp($$renderer, { class: 'h-3 w-3' });
										$$renderer.push(`<!----> <span class="text-xs font-medium">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Status Badge"))}</span></div> <img${$.attr('src', badgeStatusUrl())} alt="Status Badge" class="h-5"/> `);

										CopyButton($$renderer, {
											variant: 'ghost',
											size: 'icon-sm',
											text: badgeStatusUrl(),
											class: 'rounded-btn',
											onclick: () => handleBadgeCopy("status"),
											children: ($$renderer) => {
												Copy($$renderer, {});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if (badgeUptimeUrl()) {
										$$renderer.push(`<!--[0--><div class="flex items-center justify-between gap-2 rounded-3xl border px-2 py-1"><div class="flex items-center gap-2">`);
										Percent($$renderer, { class: 'h-3 w-3' });
										$$renderer.push(`<!----> <span class="text-xs font-medium">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Uptime Badge"))}</span></div> <img${$.attr('src', badgeUptimeUrl())} alt="Uptime Badge" class="h-5"/> `);

										CopyButton($$renderer, {
											variant: 'ghost',
											size: 'icon-sm',
											text: badgeUptimeUrl(),
											class: 'rounded-btn hover:bg-transparent',
											onclick: () => handleBadgeCopy("uptime"),
											children: ($$renderer) => {
												Copy($$renderer, {});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if (badgeLatencyAvgUrl()) {
										$$renderer.push(`<!--[0--><div class="flex items-center justify-between gap-2 rounded-3xl border px-2 py-1"><div class="flex items-center gap-2">`);
										Timer($$renderer, { class: 'h-3 w-3' });
										$$renderer.push(`<!----> <span class="text-xs font-medium">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Avg Latency"))}</span></div> <img${$.attr('src', badgeLatencyAvgUrl())} alt="Avg Latency Badge" class="h-5"/> `);

										CopyButton($$renderer, {
											variant: 'ghost',
											size: 'icon-sm',
											text: badgeLatencyAvgUrl(),
											class: 'rounded-btn',
											onclick: () => handleBadgeCopy("latency_avg"),
											children: ($$renderer) => {
												Copy($$renderer, {});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if (badgeLatencyMaxUrl()) {
										$$renderer.push(`<!--[0--><div class="flex items-center justify-between gap-2 rounded-3xl border px-2 py-1"><div class="flex items-center gap-2">`);
										Timer($$renderer, { class: 'h-3 w-3' });
										$$renderer.push(`<!----> <span class="text-xs font-medium">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Max Latency"))}</span></div> <img${$.attr('src', badgeLatencyMaxUrl())} alt="Max Latency Badge" class="h-5"/> `);

										CopyButton($$renderer, {
											variant: 'ghost',
											size: 'icon-sm',
											text: badgeLatencyMaxUrl(),
											class: 'rounded-btn',
											onclick: () => handleBadgeCopy("latency_max"),
											children: ($$renderer) => {
												Copy($$renderer, {});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if (badgeLatencyMinUrl()) {
										$$renderer.push(`<!--[0--><div class="flex items-center justify-between gap-2 rounded-3xl border px-2 py-1"><div class="flex items-center gap-2">`);
										Timer($$renderer, { class: 'h-3 w-3' });
										$$renderer.push(`<!----> <span class="text-xs font-medium">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Min Latency"))}</span></div> <img${$.attr('src', badgeLatencyMinUrl())} alt="Min Latency Badge" class="h-5"/> `);

										CopyButton($$renderer, {
											variant: 'ghost',
											size: 'icon-sm',
											text: badgeLatencyMinUrl(),
											class: 'rounded-btn',
											onclick: () => handleBadgeCopy("latency_min"),
											children: ($$renderer) => {
												Copy($$renderer, {});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--></div></div> <div><h3 class="mb-2 text-sm font-semibold">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Live Status"))}</h3> <div class="flex flex-row gap-2">`);

									if (badgeDotUrl()) {
										$$renderer.push(`<!--[0--><div class="flex items-center gap-2 rounded-3xl border px-2 py-1"><img${$.attr('src', badgeDotUrl())} alt="Status Dot" class="h-4"/> <span class="text-xs font-medium">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Standard"))}</span> `);

										CopyButton($$renderer, {
											variant: 'ghost',
											size: 'icon-sm',
											text: badgeDotUrl(),
											class: 'rounded-btn',
											onclick: () => handleBadgeCopy("dot"),
											children: ($$renderer) => {
												Copy($$renderer, {});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if (badgeDotPingUrl()) {
										$$renderer.push(`<!--[0--><div class="flex items-center gap-2 rounded-3xl border px-2 py-1"><img${$.attr('src', badgeDotPingUrl())} alt="Status Dot Ping" class="h-4"/> <span class="text-xs font-medium">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Pinging"))}</span> `);

										CopyButton($$renderer, {
											variant: 'ghost',
											size: 'icon-sm',
											text: badgeDotPingUrl(),
											class: 'rounded-btn',
											onclick: () => handleBadgeCopy("dot_ping"),
											children: ($$renderer) => {
												Copy($$renderer, {});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--></div></div></div>`);
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