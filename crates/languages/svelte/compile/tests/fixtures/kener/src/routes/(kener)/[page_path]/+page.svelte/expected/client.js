import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from "$app/environment";
import * as Item from "$lib/components/ui/item/index.js";
import EventsCard from "$lib/components/EventsCard.svelte";
import MonitorBar from "$lib/components/MonitorBar.svelte";
import ThemePlus from "$lib/components/ThemePlus.svelte";
import IncidentItem from "$lib/components/IncidentItem.svelte";
import MaintenanceItem from "$lib/components/MaintenanceItem.svelte";
import mdToHTML from "$lib/marked.js";
import clientResolver, { absoluteResolve } from "$lib/client/resolver.js";
import { resolve } from "$app/paths";
import { selectedTimezone } from "$lib/stores/timezone";
import { getEndOfDayAtTz } from "$lib/client/datetime";
import { requestMonitorBar } from "$lib/client/monitor-bar-client";
import { SveltePurify } from "@humanspeak/svelte-purify";
import GC from "$lib/global-constants.js";

var root = $.from_html(`<meta property="og:title"/>`);
var root_1 = $.from_html(`<meta name="description"/> <meta property="og:description"/>`, 1);
var root_2 = $.from_html(`<meta property="og:image"/> <meta name="twitter:image"/>`, 1);
var root_3 = $.from_html(`<!> <!> <meta property="og:type" content="website"/> <meta name="twitter:card" content="summary_large_image"/> <!>`, 1);
var root_4 = $.from_html(`<img alt="Page Logo" class="aspect-auto w-12 rounded object-cover"/>`);
var root_5 = $.from_html(`<h1><!></h1>`);
var root_6 = $.from_html(`<h2><div class="prose prose-sm dark:prose-invert max-w-none"><!></div></h2>`);
var root_7 = $.from_html(`<!> <!>`, 1);
var root_8 = $.from_html(`<div class=" rounded-3xl border p-3 sm:p-4"><!></div>`);
var root_9 = $.from_html(`<div class="flex flex-col gap-3"></div>`);
var root_10 = $.from_html(`<div class="rounded-3xl border p-3 sm:p-4"><!></div>`);
var root_11 = $.from_html(`<div><!></div>`);
var root_12 = $.from_html(`<!> <!> <!> <!> <div class="overflow-hidden rounded-3xl border"><div></div></div>`, 1);
var root_13 = $.from_html(`<div class="flex flex-col gap-3 sm:gap-4"><!> <div class="flex flex-col gap-2 px-3 py-2 sm:px-4"><!> <!></div> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $selectedTimezone = () => $.store_get(selectedTimezone, '$selectedTimezone', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let pageSettings = $.derived(() => $$props.data.pageDetails.page_settings);

	let barCount = $.derived(() => $$props.data.isMobile
		? $.get(pageSettings)?.monitor_status_history_days.mobile || GC.DEFAULT_STATUS_HISTORY_DAYS_MOBILE
		: $.get(pageSettings)?.monitor_status_history_days.desktop || GC.DEFAULT_STATUS_HISTORY_DAYS_DESKTOP);

	let endOfDayTodayAtTz = $.derived(() => getEndOfDayAtTz($selectedTimezone()));
	let monitorBarDataByTag = $.state($.proxy({}));
	let monitorBarErrorByTag = $.state($.proxy({}));
	let requestVersion = 0;
	let viewType = $.derived(() => $.get(pageSettings)?.monitor_layout_style);
	let isCompact = $.derived(() => $.get(viewType) === "compact-list" || $.get(viewType) === "compact-grid");
	let showInlineEvents = $.derived(() => $$props.data.eventDisplaySettings?.showInlineEvents === true);

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

	$.user_effect(() => {
		const tags = $$props.data.monitorTags || [];
		const days = $.get(barCount);
		const currentRequestVersion = ++requestVersion;

		$.set(monitorBarDataByTag, {}, true);
		$.set(monitorBarErrorByTag, {}, true);

		if (!browser || !tags.length) return;

		void Promise.all(tags.map(async (tag) => {
			try {
				const monitorBarData = await requestMonitorBar(tag, days, $.get(endOfDayTodayAtTz));

				return { tag, ok: true, monitorBarData };
			} catch(err) {
				const errorMessage = err instanceof Error ? err.message : "Unknown error";

				return { tag, ok: false, errorMessage };
			}
		})).then((results) => {
			if (currentRequestVersion !== requestVersion) return;

			const nextDataByTag = {};
			const nextErrorByTag = {};

			for (const result of results) {
				if (result.ok) {
					nextDataByTag[result.tag] = result.monitorBarData;
				} else {
					nextErrorByTag[result.tag] = result.errorMessage;
				}
			}

			$.set(monitorBarDataByTag, nextDataByTag, true);
			$.set(monitorBarErrorByTag, nextErrorByTag, true);
		});
	});

	var div = root_13();

	$.head('ie2ftj', ($$anchor) => {
		var fragment = root_3();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var meta = root();

				$.template_effect(() => $.set_attribute(meta, 'content', $$props.data.metaPageTitle));

				$.deferred_template_effect(() => {
					$.document.title = $$props.data.metaPageTitle ?? '';
				});

				$.append($$anchor, meta);
			};

			var consequent_1 = ($$anchor) => {
				var meta_1 = root();

				$.template_effect(() => $.set_attribute(meta_1, 'content', $$props.data.pageDetails.page_title + " - " + $$props.data.siteName));

				$.deferred_template_effect(() => {
					$.document.title = `${$$props.data.pageDetails.page_title ?? ''} - ${$$props.data.siteName ?? ''}`;
				});

				$.append($$anchor, meta_1);
			};

			var alternate = ($$anchor) => {
				var meta_2 = root();

				$.template_effect(() => $.set_attribute(meta_2, 'content', $$props.data.siteName + " - Status Page"));

				$.deferred_template_effect(() => {
					$.document.title = `${$$props.data.siteName ?? ''} - Status Page`;
				});

				$.append($$anchor, meta_2);
			};

			$.if(node, ($$render) => {
				if ($$props.data.metaPageTitle) $$render(consequent); else if ($$props.data.pageDetails?.page_title) $$render(consequent_1, 1); else $$render(alternate, -1);
			});
		}

		var node_1 = $.sibling(node, 2);

		{
			var consequent_2 = ($$anchor) => {
				var fragment_1 = root_1();
				var meta_3 = $.first_child(fragment_1);
				var meta_4 = $.sibling(meta_3, 2);

				$.template_effect(() => {
					$.set_attribute(meta_3, 'content', $$props.data.metaPageDescription);
					$.set_attribute(meta_4, 'content', $$props.data.metaPageDescription);
				});

				$.append($$anchor, fragment_1);
			};

			var consequent_3 = ($$anchor) => {
				var fragment_2 = root_1();
				var meta_5 = $.first_child(fragment_2);
				var meta_6 = $.sibling(meta_5, 2);

				$.template_effect(() => {
					$.set_attribute(meta_5, 'content', $$props.data.pageDetails.page_header);
					$.set_attribute(meta_6, 'content', $$props.data.pageDetails.page_header);
				});

				$.append($$anchor, fragment_2);
			};

			var alternate_1 = ($$anchor) => {
				var fragment_3 = root_1();
				var meta_7 = $.first_child(fragment_3);
				var meta_8 = $.sibling(meta_7, 2);

				$.template_effect(() => {
					$.set_attribute(meta_7, 'content', ($$props.data.pageDetails?.page_title || "Status Page") + " - Status Page");
					$.set_attribute(meta_8, 'content', ($$props.data.pageDetails?.page_title || "Status Page") + " - Status Page");
				});

				$.append($$anchor, fragment_3);
			};

			$.if(node_1, ($$render) => {
				if ($$props.data.metaPageDescription) $$render(consequent_2); else if ($$props.data.pageDetails?.page_header) $$render(consequent_3, 1); else $$render(alternate_1, -1);
			});
		}

		var node_2 = $.sibling(node_1, 6);

		{
			var consequent_4 = ($$anchor) => {
				var fragment_4 = root_2();
				var meta_9 = $.first_child(fragment_4);
				var meta_10 = $.sibling(meta_9, 2);

				$.template_effect(
					($0, $1) => {
						$.set_attribute(meta_9, 'content', $0);
						$.set_attribute(meta_10, 'content', $1);
					},
					[
						() => absoluteResolve(resolve, $$props.data.siteUrl, $$props.data.socialPagePreviewImage),
						() => absoluteResolve(resolve, $$props.data.siteUrl, $$props.data.socialPagePreviewImage)
					]
				);

				$.append($$anchor, fragment_4);
			};

			$.if(node_2, ($$render) => {
				if ($$props.data.socialPagePreviewImage) $$render(consequent_4);
			});
		}

		$.append($$anchor, fragment);
	});

	var node_3 = $.child(div);

	ThemePlus(node_3, {
		get monitor_tags() {
			return $$props.data.monitorTags;
		},

		get hideNotificationsPopover() {
			return $.get(showInlineEvents);
		}
	});

	var div_1 = $.sibling(node_3, 2);
	var node_4 = $.child(div_1);

	{
		var consequent_5 = ($$anchor) => {
			var img = root_4();

			$.template_effect(($0) => $.set_attribute(img, 'src', $0), [
				() => clientResolver(resolve, $$props.data.pageDetails.page_logo)
			]);

			$.append($$anchor, img);
		};

		$.if(node_4, ($$render) => {
			if ($$props.data.pageDetails?.page_logo) $$render(consequent_5);
		});
	}

	var node_5 = $.sibling(node_4, 2);

	$.component(node_5, () => Item.Root, ($$anchor, Item_Root) => {
		Item_Root($$anchor, {
			class: 'px-0 py-0',
			children: ($$anchor, $$slotProps) => {
				var fragment_5 = $.comment();
				var node_6 = $.first_child(fragment_5);

				$.component(node_6, () => Item.Content, ($$anchor, Item_Content) => {
					Item_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_7();
							var node_7 = $.first_child(fragment_6);

							{
								var consequent_6 = ($$anchor) => {
									var h1 = root_5();
									var node_8 = $.child(h1);

									$.component(node_8, () => Item.Title, ($$anchor, Item_Title) => {
										Item_Title($$anchor, {
											class: 'text-2xl sm:text-3xl',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text();

												$.template_effect(() => $.set_text(text, $$props.data.pageDetails.page_header));
												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									$.reset(h1);
									$.append($$anchor, h1);
								};

								$.if(node_7, ($$render) => {
									if ($$props.data.pageDetails?.page_header) $$render(consequent_6);
								});
							}

							var node_9 = $.sibling(node_7, 2);

							{
								var consequent_7 = ($$anchor) => {
									var h2 = root_6();
									var div_2 = $.child(h2);
									var node_10 = $.child(div_2);

									{
										let $0 = $.derived(() => mdToHTML($$props.data.pageDetails.page_subheader));

										SveltePurify(node_10, {
											get html() {
												return $.get($0);
											}
										});
									}

									$.reset(div_2);
									$.reset(h2);
									$.append($$anchor, h2);
								};

								$.if(node_9, ($$render) => {
									if ($$props.data.pageDetails?.page_subheader) $$render(consequent_7);
								});
							}

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

	$.reset(div_1);

	var node_11 = $.sibling(div_1, 2);

	{
		var consequent_11 = ($$anchor) => {
			var fragment_8 = root_12();
			var node_12 = $.first_child(fragment_8);

			EventsCard(node_12, {
				get statusClass() {
					return $$props.data.pageStatus.statusClass;
				},

				get statusText() {
					return $$props.data.pageStatus.statusSummary;
				}
			});

			var node_13 = $.sibling(node_12, 2);

			{
				var consequent_8 = ($$anchor) => {
					var div_3 = root_9();

					$.each(div_3, 23, () => $$props.data.ongoingIncidents, (incident, i) => incident.id ?? i, ($$anchor, incident) => {
						var div_4 = root_8();
						var node_14 = $.child(div_4);

						IncidentItem(node_14, {
							get incident() {
								return $.get(incident);
							}
						});

						$.reset(div_4);
						$.append($$anchor, div_4);
					});

					$.reset(div_3);
					$.append($$anchor, div_3);
				};

				$.if(node_13, ($$render) => {
					if ($.get(showInlineEvents) && $$props.data.ongoingIncidents && $$props.data.ongoingIncidents.length > 0) $$render(consequent_8);
				});
			}

			var node_15 = $.sibling(node_13, 2);

			{
				var consequent_9 = ($$anchor) => {
					var div_5 = root_9();

					$.each(div_5, 23, () => $$props.data.ongoingMaintenances, (maintenance, i) => maintenance.id ?? i, ($$anchor, maintenance) => {
						var div_6 = root_10();
						var node_16 = $.child(div_6);

						MaintenanceItem(node_16, {
							get maintenance() {
								return $.get(maintenance);
							}
						});

						$.reset(div_6);
						$.append($$anchor, div_6);
					});

					$.reset(div_5);
					$.append($$anchor, div_5);
				};

				$.if(node_15, ($$render) => {
					if ($.get(showInlineEvents) && $$props.data.ongoingMaintenances && $$props.data.ongoingMaintenances.length > 0) $$render(consequent_9);
				});
			}

			var node_17 = $.sibling(node_15, 2);

			{
				var consequent_10 = ($$anchor) => {
					var div_7 = root_9();

					$.each(div_7, 23, () => $$props.data.upcomingMaintenances, (maintenance, i) => maintenance.id ?? i, ($$anchor, maintenance) => {
						var div_8 = root_10();
						var node_18 = $.child(div_8);

						MaintenanceItem(node_18, {
							get maintenance() {
								return $.get(maintenance);
							}
						});

						$.reset(div_8);
						$.append($$anchor, div_8);
					});

					$.reset(div_7);
					$.append($$anchor, div_7);
				};

				$.if(node_17, ($$render) => {
					if ($.get(showInlineEvents) && $$props.data.upcomingMaintenances && $$props.data.upcomingMaintenances.length > 0) $$render(consequent_10);
				});
			}

			var div_9 = $.sibling(node_17, 2);
			var div_10 = $.child(div_9);

			$.each(div_10, 22, () => $$props.data.monitorTags, (tag) => tag, ($$anchor, tag, i) => {
				var div_11 = root_11();
				var node_19 = $.child(div_11);

				{
					let $0 = $.derived(() => $$props.data.monitorGroupMembersByTag?.[tag] || []);
					let $1 = $.derived(() => $.get(viewType) === "compact-grid" || $.get(viewType) === "default-grid");

					MonitorBar(node_19, {
						get tag() {
							return tag;
						},

						get prefetchedData() {
							return $.get(monitorBarDataByTag)[tag];
						},

						get prefetchedError() {
							return $.get(monitorBarErrorByTag)[tag];
						},

						get days() {
							return $.get(barCount);
						},

						get endOfDayTodayAtTz() {
							return $.get(endOfDayTodayAtTz);
						},

						get groupChildTags() {
							return $.get($0);
						},

						get compact() {
							return $.get(isCompact);
						},

						get grid() {
							return $.get($1);
						}
					});
				}

				$.reset(div_11);

				$.template_effect(($0) => $.set_class(div_11, 1, `${$0 ?? ''} px-2 py-2 sm:px-0`), [
					() => $.get(viewType) === 'compact-grid' || $.get(viewType) === 'default-grid'
						? `${getGridItemSpanClass($.get(i), $$props.data.monitorTags.length, $.get(viewType))} bg-background`
						: $.get(i) < $$props.data.monitorTags.length - 1 ? 'border-b' : ''
				]);

				$.append($$anchor, div_11);
			});

			$.reset(div_10);
			$.reset(div_9);

			$.template_effect(($0) => $.set_class(div_10, 1, $0), [
				() => `grid grid-cols-1 ${getGridContainerClass($.get(viewType))}`
			]);

			$.append($$anchor, fragment_8);
		};

		$.if(node_11, ($$render) => {
			if (!!$$props.data.monitorTags.length) $$render(consequent_11);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}