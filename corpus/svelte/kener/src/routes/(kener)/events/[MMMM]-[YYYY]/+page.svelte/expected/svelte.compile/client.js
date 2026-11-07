import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<meta property="og:image"/> <meta name="twitter:image"/>`, 1);
var root_1 = $.from_html(`<meta name="description"/> <meta property="og:title"/> <meta property="og:description"/> <meta property="og:type" content="website"/> <meta name="twitter:card" content="summary_large_image"/> <!>`, 1);
var root_2 = $.from_html(`<p class="text-3xl"> </p>`);
var root_3 = $.from_html(`<div class="flex items-center justify-center py-12"><!></div>`);
var root_4 = $.from_html(`<div class="mx-auto mb-4 text-4xl">🎉</div> <h2 class="text-xl font-semibold"> </h2> <p class="text-muted-foreground mt-2"> </p>`, 1);
var root_5 = $.from_html(`<div class="flex flex-col gap-2 rounded-3xl border p-4"><!></div>`);
var root_6 = $.from_html(`<div class="flex flex-col gap-2"><div class="bg-secondary mt-4 w-fit rounded-3xl border px-4 py-2 text-xs font-medium"> </div> <div class="flex flex-col gap-2"></div></div>`);
var root_7 = $.from_html(`<!> `, 1);
var root_8 = $.from_html(`<div></div>`);
var root_9 = $.from_html(` <!>`, 1);
var root_10 = $.from_html(`<div class="flex flex-col gap-3"><!> <div class="flex flex-col gap-4 sm:flex-row"><div class="flex flex-row justify-start gap-y-3 rounded-3xl border p-4"><div class="flex flex-1 flex-row items-center justify-center gap-4"><div class="flex w-full flex-row items-center justify-between gap-4"><!> <p class="text-2xl"> </p> <!></div></div></div> <div class="flex flex-1 flex-col justify-around gap-y-4 rounded-3xl border p-4"><div class="flex flex-wrap gap-x-3"><div class="flex flex-1 flex-row items-center gap-2"><!> <p class="text-sm leading-4 font-medium"> </p></div> <div class="flex flex-1 flex-row items-center gap-2"><!> <p class="text-sm leading-4 font-medium"> </p></div></div></div></div> <!> <div class="flex justify-between"><!> <!></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $formatDate = () => $.store_get(formatDate, '$formatDate', $$stores);
	const $t = () => $.store_get(t, '$t', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const pagePath = $.derived(() => !!page.params.page_path ? `/${page.params.page_path}` : "");
	const MIN_YEAR = 2023;

	// State
	let loading = $.state(true);

	let incidents = $.state($.proxy([]));
	let maintenances = $.state($.proxy([]));

	// Parse the current month from params (derived from reactive data)
	const parsedDate = $.derived(() => parse($$props.data.monthParam, "MMMM-yyyy", new Date()));

	const currentMonth = $.derived(() => format($.get(parsedDate), "MMMM yyyy"));

	// Navigation (derived from reactive parsedDate)
	const prevMonth = $.derived(() => subMonths($.get(parsedDate), 1));

	const nextMonth = $.derived(() => addMonths($.get(parsedDate), 1));
	const prevMonthPath = $.derived(() => format($.get(prevMonth), "MMMM-yyyy"));
	const nextMonthPath = $.derived(() => format($.get(nextMonth), "MMMM-yyyy"));

	// Determine if navigation buttons should show
	const currentDate = new Date();

	const maxDate = addMonths(currentDate, 12);
	const minDate = new Date(MIN_YEAR, 0, 1);
	const showPrevButton = $.derived(() => $.get(prevMonth) >= minDate);
	const showNextButton = $.derived(() => $.get(nextMonth) <= maxDate);

	// Counts
	let numberOfIncidents = $.derived(() => $.get(incidents).length);

	let numberOfMaintenances = $.derived(() => $.get(maintenances).length);

	// Unified event type for display
	// Group events by day
	// Unix timestamp of start of day
	let eventsByDay = $.derived(() => {
		const allEvents = [];

		// Add incidents
		for (const incident of $.get(incidents)) {
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
		for (const maintenance of $.get(maintenances)) {
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
		$.set(loading, true);

		try {
			const response = await fetch(clientResolver(resolve, "/dashboard-apis/events-by-month") + `?page_path=${page.params.page_path}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					start_ts: $$props.data.monthStartTs,
					end_ts: $$props.data.monthEndTs
				})
			});

			if (response.ok) {
				const result = await response.json();

				$.set(incidents, result.incidents || [], true);
				$.set(maintenances, result.maintenances || [], true);
			}
		} catch(e) {
			console.error("Failed to fetch events:", e);
		} finally {
			$.set(loading, false);
		}
	}

	onMount(() => {
		fetchEvents();
	});

	var div = root_10();

	$.head('11r5cs5', ($$anchor) => {
		var fragment = root_1();
		var meta = $.first_child(fragment);
		var meta_1 = $.sibling(meta, 2);
		var meta_2 = $.sibling(meta_1, 2);
		var node = $.sibling(meta_2, 6);

		{
			var consequent = ($$anchor) => {
				var fragment_1 = root();
				var meta_3 = $.first_child(fragment_1);
				var meta_4 = $.sibling(meta_3, 2);

				$.template_effect(
					($0, $1) => {
						$.set_attribute(meta_3, 'content', $0);
						$.set_attribute(meta_4, 'content', $1);
					},
					[
						() => absoluteResolve(resolve, $$props.data.siteUrl, $$props.data.socialPreviewImage),
						() => absoluteResolve(resolve, $$props.data.siteUrl, $$props.data.socialPreviewImage)
					]
				);

				$.append($$anchor, fragment_1);
			};

			$.if(node, ($$render) => {
				if ($$props.data.socialPreviewImage) $$render(consequent);
			});
		}

		$.template_effect(() => {
			$.set_attribute(meta, 'content', `${$.get(currentMonth)} maintenances and incidents for ${$$props.data.siteName}`);
			$.set_attribute(meta_1, 'content', `${$.get(currentMonth)} - Maintenances & Incidents - ${$$props.data.siteName}`);
			$.set_attribute(meta_2, 'content', `${$.get(currentMonth)} maintenances and incidents for ${$$props.data.siteName}`);
		});

		$.deferred_template_effect(() => {
			$.document.title = `${$.get(currentMonth) ?? ''} - Maintenances & Incidents - ${$$props.data.siteName ?? ''}`;
		});

		$.append($$anchor, fragment);
	});

	var node_1 = $.child(div);

	ThemePlus(node_1, {});

	var div_1 = $.sibling(node_1, 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var node_2 = $.child(div_4);

	{
		let $0 = $.derived(() => clientResolver(resolve, `${$.get(pagePath)}/events/${$.get(prevMonthPath)}`));

		Button(node_2, {
			rel: 'external',
			variant: 'outline',
			class: 'size-8 rounded-full p-0 shadow-none',
			get href() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_2 = $.comment();
				var node_3 = $.first_child(fragment_2);

				$.component(node_3, () => ICONS.CHEVRON_LEFT, ($$anchor, ICONS_CHEVRON_LEFT) => {
					ICONS_CHEVRON_LEFT($$anchor, { class: 'size-5' });
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	}

	var p = $.sibling(node_2, 2);
	var text = $.only_child(p, true);
	var node_4 = $.sibling(p, 2);

	{
		let $0 = $.derived(() => clientResolver(resolve, `${$.get(pagePath)}/events/${$.get(nextMonthPath)}`));

		Button(node_4, {
			rel: 'external',
			get href() {
				return $.get($0);
			},
			variant: 'outline',
			class: 'size-8 rounded-full p-0 shadow-none',
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = $.comment();
				var node_5 = $.first_child(fragment_3);

				$.component(node_5, () => ICONS.CHEVRON_RIGHT, ($$anchor, ICONS_CHEVRON_RIGHT) => {
					ICONS_CHEVRON_RIGHT($$anchor, { class: 'size-5' });
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_4);
	$.reset(div_3);
	$.reset(div_2);

	var div_5 = $.sibling(div_2, 2);
	var div_6 = $.child(div_5);
	var div_7 = $.child(div_6);
	var node_6 = $.child(div_7);

	{
		var consequent_1 = ($$anchor) => {
			Check($$anchor, { class: 'text-up' });
		};

		var alternate = ($$anchor) => {
			var p_1 = root_2();
			var text_1 = $.only_child(p_1, true);

			$.template_effect(() => $.set_text(text_1, $.get(numberOfIncidents)));
			$.append($$anchor, p_1);
		};

		$.if(node_6, ($$render) => {
			if ($.get(numberOfIncidents) === 0) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	var p_2 = $.sibling(node_6, 2);
	var text_2 = $.only_child(p_2, true);

	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var node_7 = $.child(div_8);

	{
		var consequent_2 = ($$anchor) => {
			Check($$anchor, { class: 'text-up' });
		};

		var alternate_1 = ($$anchor) => {
			var p_3 = root_2();
			var text_3 = $.only_child(p_3, true);

			$.template_effect(() => $.set_text(text_3, $.get(numberOfMaintenances)));
			$.append($$anchor, p_3);
		};

		$.if(node_7, ($$render) => {
			if ($.get(numberOfMaintenances) === 0) $$render(consequent_2); else $$render(alternate_1, -1);
		});
	}

	var p_4 = $.sibling(node_7, 2);
	var text_4 = $.only_child(p_4, true);

	$.reset(div_8);
	$.reset(div_6);
	$.reset(div_5);
	$.reset(div_1);

	var node_8 = $.sibling(div_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_9 = root_3();
			var node_9 = $.child(div_9);

			Spinner(node_9, { class: 'size-8' });
			$.reset(div_9);
			$.append($$anchor, div_9);
		};

		var consequent_4 = ($$anchor) => {
			var fragment_6 = $.comment();
			var node_10 = $.first_child(fragment_6);

			$.component(node_10, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'rounded-3xl border bg-transparent shadow-none',
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = $.comment();
						var node_11 = $.first_child(fragment_7);

						$.component(node_11, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								class: ' py-12 text-center',
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_4();
									var h2 = $.sibling($.first_child(fragment_8), 2);
									var text_5 = $.only_child(h2, true);
									var p_5 = $.sibling(h2, 2);
									var text_6 = $.only_child(p_5, true);

									$.template_effect(
										($0, $1) => {
											$.set_text(text_5, $0);
											$.set_text(text_6, $1);
										},
										[
											() => $t()("No Events in %currentMonth", { currentMonth: $.get(currentMonth) }),
											() => $t()("There are no incidents or maintenances scheduled for this month.")
										]
									);

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
		};

		var alternate_2 = ($$anchor) => {
			var fragment_9 = $.comment();
			var node_12 = $.first_child(fragment_9);

			$.each(node_12, 17, () => $.get(eventsByDay), $.index, ($$anchor, day) => {
				var div_10 = root_6();
				var div_11 = $.child(div_10);
				var text_7 = $.only_child(div_11, true);
				var div_12 = $.sibling(div_11, 2);

				$.each(div_12, 21, () => $.get(day).events, $.index, ($$anchor, event) => {
					var div_13 = root_5();
					var node_13 = $.child(div_13);

					{
						var consequent_5 = ($$anchor) => {
							IncidentItem($$anchor, {
								get incident() {
									return $.get(event).incident;
								}
							});
						};

						var consequent_6 = ($$anchor) => {
							MaintenanceItem($$anchor, {
								get maintenance() {
									return $.get(event).maintenance;
								}
							});
						};

						$.if(node_13, ($$render) => {
							if ($.get(event).type === "incident" && $.get(event).incident) $$render(consequent_5); else if ($.get(event).maintenance) $$render(consequent_6, 1);
						});
					}

					$.reset(div_13);
					$.append($$anchor, div_13);
				});

				$.reset(div_12);
				$.reset(div_10);

				$.template_effect(($0) => $.set_text(text_7, $0), [
					() => $formatDate()($.get(day).date, page.data.dateAndTimeFormat.dateOnly)
				]);

				$.append($$anchor, div_10);
			});

			$.append($$anchor, fragment_9);
		};

		$.if(node_8, ($$render) => {
			if ($.get(loading)) $$render(consequent_3); else if ($.get(eventsByDay).length === 0) $$render(consequent_4, 1); else $$render(alternate_2, -1);
		});
	}

	var div_14 = $.sibling(node_8, 2);
	var node_14 = $.child(div_14);

	{
		var consequent_7 = ($$anchor) => {
			{
				let $0 = $.derived(() => clientResolver(resolve, `${$.get(pagePath)}/events/${$.get(prevMonthPath)}`));

				Button($$anchor, {
					variant: 'outline',
					rel: 'external',
					class: 'rounded-full shadow-none',
					get href() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_13 = root_7();
						var node_15 = $.first_child(fragment_13);

						ArrowLeft(node_15, { class: 'h-4 w-4' });

						var text_8 = $.sibling(node_15);

						$.template_effect(($0) => $.set_text(text_8, ` ${$0 ?? ''}`), [() => $formatDate()($.get(prevMonth), "MMMM yyyy")]);
						$.append($$anchor, fragment_13);
					},
					$$slots: { default: true }
				});
			}
		};

		var alternate_3 = ($$anchor) => {
			var div_15 = root_8();

			$.append($$anchor, div_15);
		};

		$.if(node_14, ($$render) => {
			if ($.get(showPrevButton)) $$render(consequent_7); else $$render(alternate_3, -1);
		});
	}

	var node_16 = $.sibling(node_14, 2);

	{
		var consequent_8 = ($$anchor) => {
			{
				let $0 = $.derived(() => clientResolver(resolve, `${$.get(pagePath)}/events/${$.get(nextMonthPath)}`));

				Button($$anchor, {
					variant: 'outline',
					rel: 'external',
					class: 'rounded-full shadow-none',
					get href() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_15 = root_9();
						var text_9 = $.first_child(fragment_15);
						var node_17 = $.sibling(text_9);

						ArrowRight(node_17, { class: 'h-4 w-4' });
						$.template_effect(($0) => $.set_text(text_9, `${$0 ?? ''} `), [() => $formatDate()($.get(nextMonth), "MMMM yyyy")]);
						$.append($$anchor, fragment_15);
					},
					$$slots: { default: true }
				});
			}
		};

		var alternate_4 = ($$anchor) => {
			var div_16 = root_8();

			$.append($$anchor, div_16);
		};

		$.if(node_16, ($$render) => {
			if ($.get(showNextButton)) $$render(consequent_8); else $$render(alternate_4, -1);
		});
	}

	$.reset(div_14);
	$.reset(div);

	$.template_effect(
		($0, $1, $2) => {
			$.set_text(text, $0);
			$.set_text(text_2, $1);
			$.set_text(text_4, $2);
		},
		[
			() => $formatDate()($.get(parsedDate), "MMMM yyyy"),
			() => $t()("Total Incidents"),
			() => $t()("Total Maintenances")
		]
	);

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}