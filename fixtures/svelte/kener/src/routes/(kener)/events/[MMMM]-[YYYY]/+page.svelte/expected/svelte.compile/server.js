import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import { Button } from "$lib/components/ui/button/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import ThemePlus from "$lib/components/ThemePlus.svelte";
import IncidentItem from "$lib/components/IncidentItem.svelte";
import MaintenanceItem from "$lib/components/MaintenanceItem.svelte";
import ArrowLeft from "@lucide/svelte/icons/arrow-left";
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import Check from "@lucide/svelte/icons/check";
import ICONS from "$lib/icons";
import { t } from "$lib/stores/i18n";
import { formatDate } from "$lib/stores/datetime";
import { resolve } from "$app/paths";
import clientResolver, { absoluteResolve } from "$lib/client/resolver.js";

import {
	format,
	parse,
	addMonths,
	subMonths,
	getUnixTime,
	startOfDay,
	formatDistanceStrict
} from "date-fns";

import { page } from "$app/state";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		const pagePath = $.derived(() => !!page.params.page_path ? `/${page.params.page_path}` : "");
		const MIN_YEAR = 2023;

		// State
		let loading = true;

		let incidents = [];
		let maintenances = [];

		// Parse the current month from params (derived from reactive data)
		const parsedDate = $.derived(() => parse(data.monthParam, "MMMM-yyyy", new Date()));

		const currentMonth = $.derived(() => format(parsedDate(), "MMMM yyyy"));

		// Navigation (derived from reactive parsedDate)
		const prevMonth = $.derived(() => subMonths(parsedDate(), 1));

		const nextMonth = $.derived(() => addMonths(parsedDate(), 1));
		const prevMonthPath = $.derived(() => format(prevMonth(), "MMMM-yyyy"));
		const nextMonthPath = $.derived(() => format(nextMonth(), "MMMM-yyyy"));

		// Determine if navigation buttons should show
		const currentDate = new Date();

		const maxDate = addMonths(currentDate, 12);
		const minDate = new Date(MIN_YEAR, 0, 1);
		const showPrevButton = $.derived(() => prevMonth() >= minDate);
		const showNextButton = $.derived(() => nextMonth() <= maxDate);

		// Counts
		let numberOfIncidents = $.derived(() => incidents.length);

		let numberOfMaintenances = $.derived(() => maintenances.length);

		// Unified event type for display
		// Group events by day
		// Unix timestamp of start of day
		let eventsByDay = $.derived(() => {
			const allEvents = [];

			// Add incidents
			for (const incident of incidents) {
				allEvents.push({
					id: incident.id,
					title: incident.title,
					start_date_time: incident.start_date_time,
					end_date_time: incident.end_date_time,
					type: "incident",
					incident,
					monitors: incident.monitors
				});
			}

			// Add maintenances
			for (const maintenance of maintenances) {
				allEvents.push({
					id: maintenance.id,
					title: maintenance.title,
					description: maintenance.description,
					start_date_time: maintenance.start_date_time,
					end_date_time: maintenance.end_date_time,
					type: "maintenance",
					maintenance,
					monitors: maintenance.monitors
				});
			}

			// Group by day
			const dayMap = new Map();

			for (const event of allEvents) {
				const dayStart = getUnixTime(startOfDay(new Date(event.start_date_time * 1000)));

				if (!dayMap.has(dayStart)) {
					dayMap.set(dayStart, []);
				}

				dayMap.get(dayStart).push(event);
			}

			// Sort days descending (newest first)
			const sortedDays = Array.from(dayMap.keys()).sort((a, b) => b - a);

			const result = sortedDays.map((dayTs) => ({
				date: dayTs,
				events: dayMap.get(dayTs).sort((a, b) => b.start_date_time - a.start_date_time)
			}));

			return result;
		});

		async function fetchEvents() {
			loading = true;

			try {
				const response = await fetch(clientResolver(resolve, "/dashboard-apis/events-by-month") + `?page_path=${page.params.page_path}`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ start_ts: data.monthStartTs, end_ts: data.monthEndTs })
				});

				if (response.ok) {
					const result = await response.json();

					incidents = result.incidents || [];
					maintenances = result.maintenances || [];
				}
			} catch(e) {
				console.error("Failed to fetch events:", e);
			} finally {
				loading = false;
			}
		}

		onMount(() => {
			fetchEvents();
		});

		$.head('11r5cs5', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(currentMonth())} - Maintenances &amp; Incidents - ${$.escape(data.siteName)}</title>`);
			});

			$$renderer.push(`<meta name="description"${$.attr('content', `${currentMonth()} maintenances and incidents for ${data.siteName}`)}/> <meta property="og:title"${$.attr('content', `${currentMonth()} - Maintenances & Incidents - ${data.siteName}`)}/> <meta property="og:description"${$.attr('content', `${currentMonth()} maintenances and incidents for ${data.siteName}`)}/> <meta property="og:type" content="website"/> <meta name="twitter:card" content="summary_large_image"/> `);

			if (data.socialPreviewImage) {
				$$renderer.push(`<!--[0--><meta property="og:image"${$.attr('content', absoluteResolve(resolve, data.siteUrl, data.socialPreviewImage))}/> <meta name="twitter:image"${$.attr('content', absoluteResolve(resolve, data.siteUrl, data.socialPreviewImage))}/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(`<div class="flex flex-col gap-3">`);
		ThemePlus($$renderer, {});
		$$renderer.push(`<!----> <div class="flex flex-col gap-4 sm:flex-row"><div class="flex flex-row justify-start gap-y-3 rounded-3xl border p-4"><div class="flex flex-1 flex-row items-center justify-center gap-4"><div class="flex w-full flex-row items-center justify-between gap-4">`);

		Button($$renderer, {
			rel: 'external',
			variant: 'outline',
			class: 'size-8 rounded-full p-0 shadow-none',
			href: clientResolver(resolve, `${pagePath()}/events/${prevMonthPath()}`),
			children: ($$renderer) => {
				if (ICONS.CHEVRON_LEFT) {
					$$renderer.push('<!--[-->');
					ICONS.CHEVRON_LEFT($$renderer, { class: 'size-5' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <p class="text-2xl">${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(parsedDate(), "MMMM yyyy"))}</p> `);

		Button($$renderer, {
			rel: 'external',
			href: clientResolver(resolve, `${pagePath()}/events/${nextMonthPath()}`),
			variant: 'outline',
			class: 'size-8 rounded-full p-0 shadow-none',
			children: ($$renderer) => {
				if (ICONS.CHEVRON_RIGHT) {
					$$renderer.push('<!--[-->');
					ICONS.CHEVRON_RIGHT($$renderer, { class: 'size-5' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div></div> <div class="flex flex-1 flex-col justify-around gap-y-4 rounded-3xl border p-4"><div class="flex flex-wrap gap-x-3"><div class="flex flex-1 flex-row items-center gap-2">`);

		if (numberOfIncidents() === 0) {
			$$renderer.push('<!--[0-->');
			Check($$renderer, { class: 'text-up' });
		} else {
			$$renderer.push(`<!--[-1--><p class="text-3xl">${$.escape(numberOfIncidents())}</p>`);
		}

		$$renderer.push(`<!--]--> <p class="text-sm leading-4 font-medium">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Total Incidents"))}</p></div> <div class="flex flex-1 flex-row items-center gap-2">`);

		if (numberOfMaintenances() === 0) {
			$$renderer.push('<!--[0-->');
			Check($$renderer, { class: 'text-up' });
		} else {
			$$renderer.push(`<!--[-1--><p class="text-3xl">${$.escape(numberOfMaintenances())}</p>`);
		}

		$$renderer.push(`<!--]--> <p class="text-sm leading-4 font-medium">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Total Maintenances"))}</p></div></div></div></div> `);

		if (loading) {
			$$renderer.push(`<!--[0--><div class="flex items-center justify-center py-12">`);
			Spinner($$renderer, { class: 'size-8' });
			$$renderer.push(`<!----></div>`);
		} else if (eventsByDay().length === 0) {
			$$renderer.push('<!--[1-->');

			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					class: 'rounded-3xl border bg-transparent shadow-none',
					children: ($$renderer) => {
						if (Card.Content) {
							$$renderer.push('<!--[-->');

							Card.Content($$renderer, {
								class: ' py-12 text-center',
								children: ($$renderer) => {
									$$renderer.push(`<div class="mx-auto mb-4 text-4xl">🎉</div> <h2 class="text-xl font-semibold">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("No Events in %currentMonth", { currentMonth: currentMonth() }))}</h2> <p class="text-muted-foreground mt-2">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("There are no incidents or maintenances scheduled for this month."))}</p>`);
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
			$$renderer.push(`<!--[-1--><!--[-->`);

			const each_array = $.ensure_array_like(eventsByDay());

			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
				let day = each_array[$$index_1];

				$$renderer.push(`<div class="flex flex-col gap-2"><div class="bg-secondary mt-4 w-fit rounded-3xl border px-4 py-2 text-xs font-medium">${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(day.date, page.data.dateAndTimeFormat.dateOnly))}</div> <div class="flex flex-col gap-2"><!--[-->`);

				const each_array_1 = $.ensure_array_like(day.events);

				for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
					let event = each_array_1[$$index];

					$$renderer.push(`<div class="flex flex-col gap-2 rounded-3xl border p-4">`);

					if (event.type === "incident" && event.incident) {
						$$renderer.push('<!--[0-->');
						IncidentItem($$renderer, { incident: event.incident });
					} else if (event.maintenance) {
						$$renderer.push('<!--[1-->');
						MaintenanceItem($$renderer, { maintenance: event.maintenance });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--> <div class="flex justify-between">`);

		if (showPrevButton()) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				variant: 'outline',
				rel: 'external',
				class: 'rounded-full shadow-none',
				href: clientResolver(resolve, `${pagePath()}/events/${prevMonthPath()}`),
				children: ($$renderer) => {
					ArrowLeft($$renderer, { class: 'h-4 w-4' });
					$$renderer.push(`<!----> ${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(prevMonth(), "MMMM yyyy"))}`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push(`<!--[-1--><div></div>`);
		}

		$$renderer.push(`<!--]--> `);

		if (showNextButton()) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				variant: 'outline',
				rel: 'external',
				class: 'rounded-full shadow-none',
				href: clientResolver(resolve, `${pagePath()}/events/${nextMonthPath()}`),
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(nextMonth(), "MMMM yyyy"))} `);
					ArrowRight($$renderer, { class: 'h-4 w-4' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push(`<!--[-1--><div></div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}