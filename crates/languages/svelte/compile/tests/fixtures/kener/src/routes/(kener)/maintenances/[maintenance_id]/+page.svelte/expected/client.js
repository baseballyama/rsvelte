import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from "$app/paths";
import { onMount } from "svelte";
import Calendar from "@lucide/svelte/icons/calendar";
import Monitor from "@lucide/svelte/icons/monitor";
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import Repeat from "@lucide/svelte/icons/repeat";
import * as Item from "$lib/components/ui/item/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import GC from "$lib/global-constants.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import * as Tooltip from "$lib/components/ui/tooltip/index.js";
import mdToHTML from "$lib/marked";
import ThemePlus from "$lib/components/ThemePlus.svelte";
import STATUS_ICON from "$lib/icons";
import { t } from "$lib/stores/i18n";
import { formatDate, formatDuration } from "$lib/stores/datetime";
import clientResolver, { absoluteResolve } from "$lib/client/resolver.js";
import { SveltePurify } from "@humanspeak/svelte-purify";
import { page } from "$app/state";

var root = $.from_html(`<meta name="description"/> <meta property="og:description"/>`, 1);
var root_1 = $.from_html(`<meta property="og:image"/> <meta name="twitter:image"/>`, 1);
var root_2 = $.from_html(`<meta property="og:title"/> <meta property="og:type" content="article"/> <meta name="twitter:card" content="summary_large_image"/> <!> <!>`, 1);
var root_3 = $.from_html(`<h1><!></h1>`);
var root_4 = $.from_html(`<!> `, 1);
var root_5 = $.from_html(`<div class="bg-background min-w-0 rounded-3xl border"><div class="prose prose-sm dark:prose-invert max-w-none min-w-0 overflow-x-auto p-4 wrap-break-word"><!></div></div>`);
var root_6 = $.from_html(`<div><div class="mb-2 flex items-center justify-between gap-2"><div class="flex items-center gap-2"><!> <!></div> <span class="text-muted-foreground text-xs"> </span></div> <div class="text-muted-foreground flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between"><span> </span> <span class="hidden sm:inline">→</span> <span> </span></div></div>`);
var root_7 = $.from_html(`<div class="bg-background rounded-3xl border"><div class="flex items-center justify-between border-b p-4"><!></div> <div class="scrollbar-hidden max-h-96 divide-y overflow-y-auto"></div></div>`);
var root_8 = $.from_html(`<div class="text-muted-foreground p-8 text-center"><!> <p> </p></div>`);
var root_9 = $.from_html(`<div></div>`);
var root_10 = $.from_html(`<div class="text-xs font-medium"> </div>`);
var root_11 = $.from_html(`<!> <!>`, 1);
var root_12 = $.from_html(`<span> </span>`);
var root_13 = $.from_html(`<!> <!> <!>`, 1);
var root_14 = $.from_html(`<div class="border-b last:border-b-0"><!></div>`);
var root_15 = $.from_html(`<div class="flex flex-col gap-3"><!> <div class="flex flex-col gap-2 px-4 py-2"><!></div> <div class="mb-4 flex flex-col items-start gap-4 rounded-3xl border p-4 text-sm"><div class="flex gap-2"><!></div> <div class="flex w-full flex-col gap-4 sm:flex-row sm:justify-between sm:gap-2"><div class="flex flex-col items-start gap-1.5"><span class="text-muted-foreground"> </span> <span> </span></div> <div class="flex flex-col items-start gap-1.5 sm:items-center"><span class="text-muted-foreground"> </span> <span> </span></div> <div class="flex flex-col items-start gap-1.5 sm:items-end"><span class="text-muted-foreground"> </span> <span> </span></div></div></div> <div class="grid min-w-0 gap-6 lg:grid-cols-3"><div class="min-w-0 space-y-6 lg:col-span-2"><!> <!></div> <div class="lg:col-span-1"><div class="bg-background rounded-3xl border"><div class="flex items-center justify-between border-b p-4"><!></div> <!></div></div></div></div> <div class="container mx-auto px-4 py-8"><div class="my-4 flex justify-end gap-2"></div></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $t = () => $.store_get(t, '$t', $$stores);
	const $formatDate = () => $.store_get(formatDate, '$formatDate', $$stores);
	const $formatDuration = () => $.store_get(formatDuration, '$formatDuration', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const MaintenanceIcon = STATUS_ICON.MAINTENANCE;

	// Reference for the scrollable container
	let eventsContainer = $.state(void 0);

	// Scroll to current event on mount
	onMount(() => {
		if ($.get(eventsContainer)) {
			const currentEventElement = $.get(eventsContainer).querySelector('[data-current="true"]');

			if (currentEventElement) {
				// Calculate position to center the current event in the container
				const containerHeight = $.get(eventsContainer).clientHeight;

				const elementTop = currentEventElement.offsetTop;
				const elementHeight = currentEventElement.clientHeight;
				const scrollPosition = elementTop - containerHeight / 2 + elementHeight / 2;

				$.get(eventsContainer).scrollTop = Math.max(0, scrollPosition);
			}
		}
	});

	// Get status badge variant for event status
	function getEventStatusBadgeClass(status) {
		switch (status) {
			case GC.SCHEDULED:
				return "bg-muted text-muted-foreground";

			case GC.ONGOING:
				return "bg-maintenance text-white";

			case GC.COMPLETED:
				return "bg-up text-white";

			case GC.CANCELLED:
				return "bg-down text-white";

			default:
				return "";
		}
	}

	// Check if maintenance is recurring (not one-time)
	function isRecurring(rrule) {
		return !rrule.includes("COUNT=1");
	}

	var fragment_3 = root_15();

	$.head('1xl3cna', ($$anchor) => {
		var fragment = root_2();
		var meta = $.first_child(fragment);
		var node = $.sibling(meta, 6);

		{
			var consequent = ($$anchor) => {
				var fragment_1 = root();
				var meta_1 = $.first_child(fragment_1);
				var meta_2 = $.sibling(meta_1, 2);

				$.template_effect(() => {
					$.set_attribute(meta_1, 'content', $$props.data.maintenance.description);
					$.set_attribute(meta_2, 'content', $$props.data.maintenance.description);
				});

				$.append($$anchor, fragment_1);
			};

			$.if(node, ($$render) => {
				if ($$props.data.maintenance.description) $$render(consequent);
			});
		}

		var node_1 = $.sibling(node, 2);

		{
			var consequent_1 = ($$anchor) => {
				var fragment_2 = root_1();
				var meta_3 = $.first_child(fragment_2);
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

				$.append($$anchor, fragment_2);
			};

			$.if(node_1, ($$render) => {
				if ($$props.data.socialPreviewImage) $$render(consequent_1);
			});
		}

		$.template_effect(() => $.set_attribute(meta, 'content', $$props.data.maintenance.title + " - " + $$props.data.siteName));

		$.deferred_template_effect(() => {
			$.document.title = $$props.data.maintenance.title + " - " + $$props.data.siteName;
		});

		$.append($$anchor, fragment);
	});

	var div = $.first_child(fragment_3);
	var node_2 = $.child(div);

	ThemePlus(node_2, {});

	var div_1 = $.sibling(node_2, 2);
	var node_3 = $.child(div_1);

	$.component(node_3, () => Item.Root, ($$anchor, Item_Root) => {
		Item_Root($$anchor, {
			class: 'mb-4 flex-col items-start px-0 sm:flex-row sm:items-center',
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = $.comment();
				var node_4 = $.first_child(fragment_4);

				$.component(node_4, () => Item.Content, ($$anchor, Item_Content) => {
					Item_Content($$anchor, {
						class: 'min-w-0 flex-1 px-0',
						children: ($$anchor, $$slotProps) => {
							var h1 = root_3();
							var node_5 = $.child(h1);

							$.component(node_5, () => Item.Title, ($$anchor, Item_Title) => {
								Item_Title($$anchor, {
									class: 'text-3xl wrap-break-word',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, $$props.data.maintenance.title));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							$.reset(h1);
							$.append($$anchor, h1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.child(div_2);
	var node_6 = $.child(div_3);

	{
		var consequent_2 = ($$anchor) => {
			Badge($$anchor, {
				variant: 'secondary',
				class: 'gap-1',
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_4();
					var node_7 = $.first_child(fragment_7);

					Repeat(node_7, { class: 'h-3 w-3' });

					var text_1 = $.sibling(node_7);

					$.template_effect(($0) => $.set_text(text_1, ` ${$0 ?? ''}`), [() => $t()("Recurring")]);
					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});
		};

		var d = $.derived(() => isRecurring($$props.data.maintenance.rrule));

		var alternate = ($$anchor) => {
			Badge($$anchor, {
				variant: 'secondary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text();

					$.template_effect(($0) => $.set_text(text_2, $0), [() => $t()("One-time")]);
					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_6, ($$render) => {
			if ($.get(d)) $$render(consequent_2); else $$render(alternate, -1);
		});
	}

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var div_5 = $.child(div_4);
	var span = $.child(div_5);
	var text_3 = $.only_child(span, true);
	var span_1 = $.sibling(span, 2);
	var text_4 = $.only_child(span_1, true);

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var span_2 = $.child(div_6);
	var text_5 = $.only_child(span_2, true);
	var span_3 = $.sibling(span_2, 2);
	var text_6 = $.only_child(span_3, true);

	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var span_4 = $.child(div_7);
	var text_7 = $.only_child(span_4, true);
	var span_5 = $.sibling(span_4, 2);
	var text_8 = $.only_child(span_5, true);

	$.reset(div_7);
	$.reset(div_4);
	$.reset(div_2);

	var div_8 = $.sibling(div_2, 2);
	var div_9 = $.child(div_8);
	var node_8 = $.child(div_9);

	{
		var consequent_3 = ($$anchor) => {
			var div_10 = root_5();
			var div_11 = $.child(div_10);
			var node_9 = $.child(div_11);

			{
				let $0 = $.derived(() => mdToHTML($$props.data.maintenance.description));

				SveltePurify(node_9, {
					get html() {
						return $.get($0);
					}
				});
			}

			$.reset(div_11);
			$.reset(div_10);
			$.append($$anchor, div_10);
		};

		$.if(node_8, ($$render) => {
			if ($$props.data.maintenance.description) $$render(consequent_3);
		});
	}

	var node_10 = $.sibling(node_8, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_12 = root_7();
			var div_13 = $.child(div_12);
			var node_11 = $.child(div_13);

			Badge(node_11, {
				variant: 'secondary',
				class: 'gap-1',
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root_4();
					var node_12 = $.first_child(fragment_10);

					Calendar(node_12, { class: 'h-3 w-3' });

					var text_9 = $.sibling(node_12);

					$.template_effect(($0) => $.set_text(text_9, ` ${$0 ?? ''}`), [
						() => $t()("Scheduled Events (%count)", { count: String($$props.data.maintenance.events.length) })
					]);

					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});

			$.reset(div_13);

			var div_14 = $.sibling(div_13, 2);

			$.each(div_14, 21, () => $$props.data.maintenance.events, (event) => event.id, ($$anchor, event) => {
				var div_15 = root_6();
				var div_16 = $.child(div_15);
				var div_17 = $.child(div_16);
				var node_13 = $.child(div_17);

				{
					let $0 = $.derived(() => getEventStatusBadgeClass($.get(event).status));

					Badge(node_13, {
						get class() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text();

							$.template_effect(($0) => $.set_text(text_10, $0), [() => $t()($.get(event).status)]);
							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});
				}

				var node_14 = $.sibling(node_13, 2);

				{
					var consequent_4 = ($$anchor) => {
						Badge($$anchor, {
							variant: 'outline',
							class: 'text-maintenance border-maintenance text-xs',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_11 = $.text();

								$.template_effect(($0) => $.set_text(text_11, $0), [() => $t()("Current")]);
								$.append($$anchor, text_11);
							},
							$$slots: { default: true }
						});
					};

					$.if(node_14, ($$render) => {
						if ($.get(event).id === $$props.data.maintenanceEvent.id) $$render(consequent_4);
					});
				}

				$.reset(div_17);

				var span_6 = $.sibling(div_17, 2);
				var text_12 = $.only_child(span_6, true);

				$.reset(div_16);

				var div_18 = $.sibling(div_16, 2);
				var span_7 = $.child(div_18);
				var text_13 = $.only_child(span_7, true);
				var span_8 = $.sibling(span_7, 4);
				var text_14 = $.only_child(span_8, true);

				$.reset(div_18);
				$.reset(div_15);

				$.template_effect(
					($0, $1, $2) => {
						$.set_attribute(div_15, 'data-current', $.get(event).id === $$props.data.maintenanceEvent.id);

						$.set_class(div_15, 1, `p-4 ${$.get(event).id === $$props.data.maintenanceEvent.id && $$props.data.maintenance.events.length > 1
							? 'bg-maintenance/10 border-l-maintenance border-l-4'
							: ''}`);

						$.set_text(text_12, $0);
						$.set_text(text_13, $1);
						$.set_text(text_14, $2);
					},
					[
						() => $formatDuration()($.get(event).start_date_time, $.get(event).end_date_time),
						() => $formatDate()($.get(event).start_date_time, page.data.dateAndTimeFormat.datePlusTime),
						() => $formatDate()($.get(event).end_date_time, page.data.dateAndTimeFormat.datePlusTime)
					]
				);

				$.append($$anchor, div_15);
			});

			$.reset(div_14);
			$.bind_this(div_14, ($$value) => $.set(eventsContainer, $$value), () => $.get(eventsContainer));
			$.reset(div_12);
			$.append($$anchor, div_12);
		};

		$.if(node_10, ($$render) => {
			if ($$props.data.maintenance.events && $$props.data.maintenance.events.length > 0) $$render(consequent_5);
		});
	}

	$.reset(div_9);

	var div_19 = $.sibling(div_9, 2);
	var div_20 = $.child(div_19);
	var div_21 = $.child(div_20);
	var node_15 = $.child(div_21);

	Badge(node_15, {
		variant: 'secondary',
		class: 'gap-1',
		children: ($$anchor, $$slotProps) => {
			var fragment_14 = root_4();
			var node_16 = $.first_child(fragment_14);

			Monitor(node_16, { class: 'h-3 w-3' });

			var text_15 = $.sibling(node_16);

			$.template_effect(($0) => $.set_text(text_15, ` ${$0 ?? ''}`), [
				() => $t()("Affected Monitors (%count)", { count: String($$props.data.affectedMonitors.length) })
			]);

			$.append($$anchor, fragment_14);
		},
		$$slots: { default: true }
	});

	$.reset(div_21);

	var node_17 = $.sibling(div_21, 2);

	{
		var consequent_6 = ($$anchor) => {
			var div_22 = root_8();
			var node_18 = $.child(div_22);

			Monitor(node_18, { class: 'mx-auto mb-2 h-8 w-8 opacity-50' });

			var p = $.sibling(node_18, 2);
			var text_16 = $.only_child(p, true);

			$.reset(div_22);
			$.template_effect(($0) => $.set_text(text_16, $0), [() => $t()("No monitors affected")]);
			$.append($$anchor, div_22);
		};

		var alternate_1 = ($$anchor) => {
			var div_23 = root_9();

			$.each(div_23, 21, () => $$props.data.affectedMonitors, (monitor) => monitor.monitor_tag, ($$anchor, monitor) => {
				var div_24 = root_14();
				var node_19 = $.child(div_24);

				$.component(node_19, () => Item.Root, ($$anchor, Item_Root_1) => {
					Item_Root_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_15 = root_13();
							var node_20 = $.first_child(fragment_15);

							$.component(node_20, () => Item.Media, ($$anchor, Item_Media) => {
								Item_Media($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_16 = $.comment();
										var node_21 = $.first_child(fragment_16);

										$.component(node_21, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
											Tooltip_Root($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_17 = root_11();
													var node_22 = $.first_child(fragment_17);

													$.component(node_22, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
														Tooltip_Trigger($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var div_25 = root_9();

																$.template_effect(($0) => $.set_class(div_25, 1, `bg-${$0 ?? ''} h-6 w-6 rounded-full`), [() => $.get(monitor).monitor_impact.toLowerCase()]);
																$.append($$anchor, div_25);
															},
															$$slots: { default: true }
														});
													});

													var node_23 = $.sibling(node_22, 2);

													$.component(node_23, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
														Tooltip_Content($$anchor, {
															arrowClasses: 'bg-foreground',
															children: ($$anchor, $$slotProps) => {
																var div_26 = root_10();
																var text_17 = $.only_child(div_26, true);

																$.template_effect(($0) => $.set_text(text_17, $0), [() => $t()("Under Maintenance")]);
																$.append($$anchor, div_26);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_17);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_16);
									},
									$$slots: { default: true }
								});
							});

							var node_24 = $.sibling(node_20, 2);

							$.component(node_24, () => Item.Content, ($$anchor, Item_Content_1) => {
								Item_Content_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_18 = root_11();
										var node_25 = $.first_child(fragment_18);

										$.component(node_25, () => Item.Title, ($$anchor, Item_Title_1) => {
											Item_Title_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_18 = $.text();

													$.template_effect(() => $.set_text(text_18, $.get(monitor).monitor_name));
													$.append($$anchor, text_18);
												},
												$$slots: { default: true }
											});
										});

										var node_26 = $.sibling(node_25, 2);

										$.component(node_26, () => Item.Description, ($$anchor, Item_Description) => {
											Item_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var span_9 = root_12();
													var text_19 = $.only_child(span_9, true);

													$.template_effect(
														($0, $1) => {
															$.set_class(span_9, 1, `text-${$0 ?? ''}`);
															$.set_text(text_19, $1);
														},
														[
															() => $.get(monitor).monitor_impact.toLowerCase(),
															() => $t()($.get(monitor).monitor_impact)
														]
													);

													$.append($$anchor, span_9);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_18);
									},
									$$slots: { default: true }
								});
							});

							var node_27 = $.sibling(node_24, 2);

							$.component(node_27, () => Item.Actions, ($$anchor, Item_Actions) => {
								Item_Actions($$anchor, {
									children: ($$anchor, $$slotProps) => {
										{
											let $0 = $.derived(() => clientResolver(resolve, `/monitors/${$.get(monitor).monitor_tag}`));

											Button($$anchor, {
												variant: 'outline',
												class: 'rounded-btn',
												get href() {
													return $.get($0);
												},
												size: 'icon',
												children: ($$anchor, $$slotProps) => {
													ArrowRight($$anchor, { class: 'h-4 w-4' });
												},
												$$slots: { default: true }
											});
										}
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_15);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_24);
				$.append($$anchor, div_24);
			});

			$.reset(div_23);
			$.append($$anchor, div_23);
		};

		$.if(node_17, ($$render) => {
			if ($$props.data.affectedMonitors.length === 0) $$render(consequent_6); else $$render(alternate_1, -1);
		});
	}

	$.reset(div_20);
	$.reset(div_19);
	$.reset(div_8);
	$.reset(div);
	$.next(2);

	$.template_effect(
		($0, $1, $2, $3, $4, $5) => {
			$.set_text(text_3, $0);
			$.set_text(text_4, $1);
			$.set_text(text_5, $2);
			$.set_text(text_6, $3);
			$.set_text(text_7, $4);
			$.set_text(text_8, $5);
		},
		[
			() => $t()("Start Time"),
			() => $formatDate()($$props.data.maintenanceEvent.start_date_time, page.data.dateAndTimeFormat.datePlusTime),
			() => $t()("End Time"),
			() => $formatDate()($$props.data.maintenanceEvent.end_date_time, page.data.dateAndTimeFormat.datePlusTime),
			() => $t()("Duration"),
			() => $formatDuration()($$props.data.maintenanceEvent.start_date_time, $$props.data.maintenanceEvent.end_date_time)
		]
	);

	$.append($$anchor, fragment_3);
	$.pop();
	$$cleanup();
}