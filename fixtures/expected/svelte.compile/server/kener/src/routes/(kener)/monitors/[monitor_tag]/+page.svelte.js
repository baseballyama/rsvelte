import * as $ from 'svelte/internal/server';
import * as Item from "$lib/components/ui/item/index.js";
import { t } from "$lib/stores/i18n";
import { formatDate } from "$lib/stores/datetime";
import { Button } from "$lib/components/ui/button/index.js";
import ThemePlus from "$lib/components/ThemePlus.svelte";
import MonitorOverview from "$lib/components/MonitorOverview.svelte";
import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";
import clientResolver, { absoluteResolve } from "$lib/client/resolver.js";
import { resolve } from "$app/paths";
import trackEvent from "$lib/beacon";
import IncidentItem from "$lib/components/IncidentItem.svelte";
import MaintenanceItem from "$lib/components/MaintenanceItem.svelte";
import { page } from "$app/state";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;

		// State
		let descriptionExpanded = false;

		let showInlineEvents = $.derived(() => data.eventDisplaySettings?.showInlineEvents === true);

		function toggleDescription(expanded) {
			descriptionExpanded = expanded;
			trackEvent("monitor_description_toggled", { expanded, monitorTag: data.monitorTag });
		}

		function trackExternalLinkClick() {
			trackEvent("monitor_external_link_clicked", { monitorTag: data.monitorTag });
		}

		$.head('b9i0il', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(data.monitorName + " - " + data.siteName)}</title>`);
			});

			$$renderer.push(`<meta property="og:title"${$.attr('content', data.monitorName + " - " + data.siteName)}/> <meta property="og:type" content="website"/> <meta name="twitter:card" content="summary_large_image"/> `);

			if (data.monitorDescription) {
				$$renderer.push(`<!--[0--><meta name="description"${$.attr('content', data.monitorDescription)}/> <meta property="og:description"${$.attr('content', data.monitorDescription)}/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (data.socialPreviewImage) {
				$$renderer.push(`<!--[0--><meta property="og:image"${$.attr('content', absoluteResolve(resolve, data.siteUrl, data.socialPreviewImage))}/> <meta name="twitter:image"${$.attr('content', absoluteResolve(resolve, data.siteUrl, data.socialPreviewImage))}/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(`<div class="flex flex-col gap-3">`);

		ThemePlus($$renderer, {
			monitor_tags: [data.monitorTag],
			embedMonitorTag: data.monitorTag,
			hideNotificationsPopover: showInlineEvents()
		});

		$$renderer.push(`<!----> <div class="flex flex-col gap-2 px-4 py-2">`);

		if (data.monitorImage) {
			$$renderer.push(`<!--[0--><img${$.attr('src', clientResolver(resolve, data.monitorImage))}${$.attr('alt', data.monitorName || "Monitor icon")} class="aspect-auto w-12 rounded object-cover"/>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (Item.Root) {
			$$renderer.push('<!--[-->');

			Item.Root($$renderer, {
				class: 'px-0 py-0 ',
				children: ($$renderer) => {
					if (Item.Content) {
						$$renderer.push('<!--[-->');

						Item.Content($$renderer, {
							children: ($$renderer) => {
								if (data.monitorName) {
									$$renderer.push(`<!--[0--><h1>`);

									if (Item.Title) {
										$$renderer.push('<!--[-->');

										Item.Title($$renderer, {
											class: 'text-3xl',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(data.monitorName)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(`</h1>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								if (data.monitorDescription) {
									$$renderer.push(`<!--[0--><h2>`);

									if (Item.Description) {
										$$renderer.push('<!--[-->');

										Item.Description($$renderer, {
											class: `text-muted-foreground w-full ${descriptionExpanded ? 'line-clamp-none' : ''} text-pretty`,
											children: ($$renderer) => {
												if (data.monitorDescription.length > 150 && !descriptionExpanded) {
													$$renderer.push(`<!--[0-->${$.escape(data.monitorDescription.slice(0, 150))}... <button class="text-accent-foreground inline font-medium hover:underline">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Read more"))}</button>`);
												} else if (data.monitorDescription.length > 150) {
													$$renderer.push(`<!--[1-->${$.escape(data.monitorDescription)} <button class="text-accent-foreground inline font-medium hover:underline">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Read less"))}</button>`);
												} else {
													$$renderer.push(`<!--[-1-->${$.escape(data.monitorDescription)}`);
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

									$$renderer.push(`</h2>`);
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

		$$renderer.push(`</div> <div class="bg-background flex flex-col justify-start gap-y-3 rounded-3xl border p-4"><div class="relative flex flex-col px-2"><h2 class="text-base font-medium">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Last Updated"))}</h2> <p class="text-muted-foreground text-xs"><span>${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(data.monitorLastStatusTimestamp * 1000, page.data.dateAndTimeFormat.datePlusTime))}</span></p> `);

		if (!!data.externalUrl) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				variant: 'outline',
				size: 'icon-sm',
				class: 'rounded-btn absolute top-0 right-0',
				href: data.externalUrl,
				target: '_blank',
				rel: 'noopener noreferrer',
				onclick: trackExternalLinkClick,
				children: ($$renderer) => {
					ArrowUpRight($$renderer, { class: 'size-4' });
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="flex items-center justify-between px-2"><div class="flex flex-col items-start gap-1"><p${$.attr_class(`text-muted-foreground text-2xl font-semibold ${$.stringify(data.textClass)}`)}>${$.escape($.store_get($$store_subs ??= {}, '$t', t)(data.monitorLastStatus))}</p> <p class="text-muted-foreground text-xs">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Latest Status"))}</p></div> `);

		if (!!data.monitorLastLatency) {
			$$renderer.push(`<!--[0--><div class="flex flex-col items-end gap-1"><p class="text-right text-2xl font-semibold">${$.escape(data.monitorLastLatency)}</p> <p class="text-muted-foreground text-xs">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Latest Latency"))}</p></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> `);

		if (showInlineEvents() && data.ongoingIncidents && data.ongoingIncidents.length > 0) {
			$$renderer.push(`<!--[0--><div class="flex flex-col gap-3"><!--[-->`);

			const each_array = $.ensure_array_like(data.ongoingIncidents);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let incident = each_array[i];

				$$renderer.push(`<div class="rounded-3xl border p-3 sm:p-4">`);
				IncidentItem($$renderer, { incident });
				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (showInlineEvents() && data.ongoingMaintenances && data.ongoingMaintenances.length > 0) {
			$$renderer.push(`<!--[0--><div class="flex flex-col gap-3"><!--[-->`);

			const each_array_1 = $.ensure_array_like(data.ongoingMaintenances);

			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
				let maintenance = each_array_1[i];

				$$renderer.push(`<div class="rounded-3xl border p-3 sm:p-4">`);
				MaintenanceItem($$renderer, { maintenance });
				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (showInlineEvents() && data.upcomingMaintenances && data.upcomingMaintenances.length > 0) {
			$$renderer.push(`<!--[0--><div class="flex flex-col gap-3"><!--[-->`);

			const each_array_2 = $.ensure_array_like(data.upcomingMaintenances);

			for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
				let maintenance = each_array_2[i];

				$$renderer.push(`<div class="rounded-3xl border p-3 sm:p-4">`);
				MaintenanceItem($$renderer, { maintenance });
				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		MonitorOverview($$renderer, {
			monitorTag: data.monitorTag,
			maxDays: data.maxDays,
			groupTags: data.extendedTags || [],
			class: 'mb-4'
		});

		$$renderer.push(`<!----></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}