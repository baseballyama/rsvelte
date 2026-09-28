import * as $ from 'svelte/internal/server';
import { browser } from "$app/environment";
import * as Item from "$lib/components/ui/item/index.js";
import EventsCard from "$lib/components/EventsCard.svelte";
import MonitorBar from "$lib/components/MonitorBar.svelte";
import ThemePlus from "$lib/components/ThemePlus.svelte";
import IncidentItem from "$lib/components/IncidentItem.svelte";
import MaintenanceItem from "$lib/components/MaintenanceItem.svelte";
import NotificationsList from "$lib/components/NotificationsList.svelte";
import mdToHTML from "$lib/marked.js";
import clientResolver, { absoluteResolve } from "$lib/client/resolver.js";
import { resolve } from "$app/paths";
import { selectedTimezone } from "$lib/stores/timezone";
import { getEndOfDayAtTz } from "$lib/client/datetime";
import { requestMonitorBar } from "$lib/client/monitor-bar-client";
import { SveltePurify } from "@humanspeak/svelte-purify";
import GC from "$lib/global-constants.js";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		let pageSettings = $.derived(() => data.pageDetails.page_settings);

		let barCount = $.derived(() => data.isMobile
			? pageSettings()?.monitor_status_history_days.mobile || GC.DEFAULT_STATUS_HISTORY_DAYS_MOBILE
			: pageSettings()?.monitor_status_history_days.desktop || GC.DEFAULT_STATUS_HISTORY_DAYS_DESKTOP);

		let endOfDayTodayAtTz = $.derived(() => getEndOfDayAtTz($.store_get($$store_subs ??= {}, '$selectedTimezone', selectedTimezone)));
		let monitorBarDataByTag = {};
		let monitorBarErrorByTag = {};
		let requestVersion = 0;
		let viewType = $.derived(() => pageSettings()?.monitor_layout_style);
		let isCompact = $.derived(() => viewType() === "compact-list" || viewType() === "compact-grid");
		let showInlineEvents = $.derived(() => data.eventDisplaySettings?.showInlineEvents === true);

		function getGridItemSpanClass(index, total, type) {
			if (type === "default-grid") {
				const mdLastRowCount = total % 2 || 2;
				const mdLastRowStart = total - mdLastRowCount;
				const isInMdLastRow = index >= mdLastRowStart;
				const mdSpan = isInMdLastRow && mdLastRowCount === 1 ? "md:col-span-4" : "md:col-span-2";
				const lgLastRowCount = total % 2 || 2;
				const lgLastRowStart = total - lgLastRowCount;
				const isInLgLastRow = index >= lgLastRowStart;
				const lgSpan = isInLgLastRow && lgLastRowCount === 1 ? "lg:col-span-4" : "lg:col-span-2";

				return `${mdSpan} ${lgSpan}`;
			}

			const smLastRowCount = total % 2 || 2;
			const smLastRowStart = total - smLastRowCount;
			const isInSmLastRow = index >= smLastRowStart;
			const smSpan = isInSmLastRow && smLastRowCount === 1 ? "sm:col-span-4" : "sm:col-span-2";
			const lgLastRowCount = total % 3 || 3;
			const lgLastRowStart = total - lgLastRowCount;
			const isInLgLastRow = index >= lgLastRowStart;

			const lgSpan = isInLgLastRow
				? lgLastRowCount === 1
					? "lg:col-span-6"
					: lgLastRowCount === 2 ? "lg:col-span-3" : "lg:col-span-2"
				: "lg:col-span-2";

			return `${smSpan} ${lgSpan}`;
		}

		function getGridContainerClass(type) {
			if (type === "compact-grid") return "bg-border gap-px sm:grid-cols-4 lg:grid-cols-6";
			if (type === "default-grid") return "bg-border gap-px md:grid-cols-4 lg:grid-cols-4";

			return "";
		}

		$.head('16s165z', $$renderer, ($$renderer) => {
			if (data.metaPageTitle) {
				$$renderer.push('<!--[0-->');

				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>${$.escape(data.metaPageTitle)}</title>`);
				});

				$$renderer.push(`<meta property="og:title"${$.attr('content', data.metaPageTitle)}/>`);
			} else if (data.pageDetails?.page_title) {
				$$renderer.push('<!--[1-->');

				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>${$.escape(data.pageDetails.page_title)} - ${$.escape(data.siteName)}</title>`);
				});

				$$renderer.push(`<meta property="og:title"${$.attr('content', data.pageDetails.page_title + " - " + data.siteName)}/>`);
			} else {
				$$renderer.push('<!--[-1-->');

				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>${$.escape(data.siteName)} - Status Page</title>`);
				});

				$$renderer.push(`<meta property="og:title"${$.attr('content', data.siteName + " - Status Page")}/>`);
			}

			$$renderer.push(`<!--]--> `);

			if (data.metaPageDescription) {
				$$renderer.push(`<!--[0--><meta name="description"${$.attr('content', data.metaPageDescription)}/> <meta property="og:description"${$.attr('content', data.metaPageDescription)}/>`);
			} else if (data.pageDetails?.page_header) {
				$$renderer.push(`<!--[1--><meta name="description"${$.attr('content', data.pageDetails.page_header)}/> <meta property="og:description"${$.attr('content', data.pageDetails.page_header)}/>`);
			} else {
				$$renderer.push(`<!--[-1--><meta name="description"${$.attr('content', (data.pageDetails?.page_title || "Status Page") + " - Status Page")}/> <meta property="og:description"${$.attr('content', (data.pageDetails?.page_title || "Status Page") + " - Status Page")}/>`);
			}

			$$renderer.push(`<!--]--> <meta property="og:type" content="website"/> <meta name="twitter:card" content="summary_large_image"/> `);

			if (data.socialPagePreviewImage) {
				$$renderer.push(`<!--[0--><meta property="og:image"${$.attr('content', absoluteResolve(resolve, data.siteUrl, data.socialPagePreviewImage))}/> <meta name="twitter:image"${$.attr('content', absoluteResolve(resolve, data.siteUrl, data.socialPagePreviewImage))}/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(`<div class="flex flex-col gap-3 sm:gap-4">`);

		ThemePlus($$renderer, {
			monitor_tags: data.monitorTags,
			hideNotificationsPopover: !!showInlineEvents()
		});

		$$renderer.push(`<!----> <div class="flex flex-col gap-2 px-3 py-2 sm:px-4">`);

		if (data.pageDetails?.page_logo) {
			$$renderer.push(`<!--[0--><img${$.attr('src', clientResolver(resolve, data.pageDetails.page_logo))} alt="Page Logo" class="aspect-auto w-12 rounded object-cover"/>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (Item.Root) {
			$$renderer.push('<!--[-->');

			Item.Root($$renderer, {
				class: 'px-0 py-0',
				children: ($$renderer) => {
					if (Item.Content) {
						$$renderer.push('<!--[-->');

						Item.Content($$renderer, {
							children: ($$renderer) => {
								if (data.pageDetails?.page_header) {
									$$renderer.push(`<!--[0--><h1>`);

									if (Item.Title) {
										$$renderer.push('<!--[-->');

										Item.Title($$renderer, {
											class: 'text-2xl sm:text-3xl',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(data.pageDetails.page_header)}`);
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

								if (data.pageDetails?.page_subheader) {
									$$renderer.push(`<!--[0--><h2><div class="prose prose-sm dark:prose-invert max-w-none">`);
									SveltePurify($$renderer, { html: mdToHTML(data.pageDetails.page_subheader) });
									$$renderer.push(`<!----></div></h2>`);
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

		$$renderer.push(`</div> <div class="grid grid-cols-1 gap-4 sm:grid-cols-16"><div${$.attr_class(`col-span-1 flex flex-col gap-3 sm:gap-4 ${!showInlineEvents() ? 'sm:col-span-16' : 'sm:col-span-11'}`)}>`);

		if (!!data.monitorTags.length) {
			$$renderer.push('<!--[0-->');

			EventsCard($$renderer, {
				statusClass: data.pageStatus.statusClass,
				statusText: data.pageStatus.statusSummary
			});

			$$renderer.push(`<!----> `);

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

			$$renderer.push(`<!--]--> <div class="overflow-hidden rounded-3xl border"><div${$.attr_class(`grid grid-cols-1 ${getGridContainerClass(viewType())}`)}><!--[-->`);

			const each_array_3 = $.ensure_array_like(data.monitorTags);

			for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
				let tag = each_array_3[i];

				$$renderer.push(`<div${$.attr_class(`${viewType() === 'compact-grid' || viewType() === 'default-grid'
					? `${getGridItemSpanClass(i, data.monitorTags.length, viewType())} bg-background`
					: i < data.monitorTags.length - 1 ? 'border-b' : ''} px-2 py-2 sm:px-0`)}>`);

				MonitorBar($$renderer, {
					tag,
					prefetchedData: monitorBarDataByTag[tag],
					prefetchedError: monitorBarErrorByTag[tag],
					days: barCount(),
					endOfDayTodayAtTz: endOfDayTodayAtTz(),
					groupChildTags: data.monitorGroupMembersByTag?.[tag] || [],
					compact: isCompact(),
					grid: viewType() === "compact-grid" || viewType() === "default-grid"
				});

				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (!!showInlineEvents()) {
			$$renderer.push(`<!--[0--><div class="col-span-1 overflow-hidden rounded-3xl border sm:col-span-5">`);
			NotificationsList($$renderer, { monitorTags: data.monitorTags });
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}