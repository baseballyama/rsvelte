import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		const MaintenanceIcon = STATUS_ICON.MAINTENANCE;

		// Reference for the scrollable container
		let eventsContainer = void 0;

		// Scroll to current event on mount
		onMount(() => {
			if (eventsContainer) {
				const currentEventElement = eventsContainer.querySelector('[data-current="true"]');

				if (currentEventElement) {
					// Calculate position to center the current event in the container
					const containerHeight = eventsContainer.clientHeight;

					const elementTop = currentEventElement.offsetTop;
					const elementHeight = currentEventElement.clientHeight;
					const scrollPosition = elementTop - containerHeight / 2 + elementHeight / 2;

					eventsContainer.scrollTop = Math.max(0, scrollPosition);
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

		$.head('1xl3cna', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(data.maintenance.title + " - " + data.siteName)}</title>`);
			});

			$$renderer.push(`<meta property="og:title"${$.attr('content', data.maintenance.title + " - " + data.siteName)}/> <meta property="og:type" content="article"/> <meta name="twitter:card" content="summary_large_image"/> `);

			if (data.maintenance.description) {
				$$renderer.push(`<!--[0--><meta name="description"${$.attr('content', data.maintenance.description)}/> <meta property="og:description"${$.attr('content', data.maintenance.description)}/>`);
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
		ThemePlus($$renderer, {});
		$$renderer.push(`<!----> <div class="flex flex-col gap-2 px-4 py-2">`);

		if (Item.Root) {
			$$renderer.push('<!--[-->');

			Item.Root($$renderer, {
				class: 'mb-4 flex-col items-start px-0 sm:flex-row sm:items-center',
				children: ($$renderer) => {
					if (Item.Content) {
						$$renderer.push('<!--[-->');

						Item.Content($$renderer, {
							class: 'min-w-0 flex-1 px-0',
							children: ($$renderer) => {
								$$renderer.push(`<h1>`);

								if (Item.Title) {
									$$renderer.push('<!--[-->');

									Item.Title($$renderer, {
										class: 'text-3xl wrap-break-word',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(data.maintenance.title)}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(`</h1>`);
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

		$$renderer.push(`</div> <div class="mb-4 flex flex-col items-start gap-4 rounded-3xl border p-4 text-sm"><div class="flex gap-2">`);

		if (isRecurring(data.maintenance.rrule)) {
			$$renderer.push('<!--[0-->');

			Badge($$renderer, {
				variant: 'secondary',
				class: 'gap-1',
				children: ($$renderer) => {
					Repeat($$renderer, { class: 'h-3 w-3' });
					$$renderer.push(`<!----> ${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Recurring"))}`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');

			Badge($$renderer, {
				variant: 'secondary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("One-time"))}`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></div> <div class="flex w-full flex-col gap-4 sm:flex-row sm:justify-between sm:gap-2"><div class="flex flex-col items-start gap-1.5"><span class="text-muted-foreground">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Start Time"))}</span> <span>${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(data.maintenanceEvent.start_date_time, page.data.dateAndTimeFormat.datePlusTime))}</span></div> <div class="flex flex-col items-start gap-1.5 sm:items-center"><span class="text-muted-foreground">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("End Time"))}</span> <span>${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(data.maintenanceEvent.end_date_time, page.data.dateAndTimeFormat.datePlusTime))}</span></div> <div class="flex flex-col items-start gap-1.5 sm:items-end"><span class="text-muted-foreground">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Duration"))}</span> <span>${$.escape($.store_get($$store_subs ??= {}, '$formatDuration', formatDuration)(data.maintenanceEvent.start_date_time, data.maintenanceEvent.end_date_time))}</span></div></div></div> <div class="grid min-w-0 gap-6 lg:grid-cols-3"><div class="min-w-0 space-y-6 lg:col-span-2">`);

		if (data.maintenance.description) {
			$$renderer.push(`<!--[0--><div class="bg-background min-w-0 rounded-3xl border"><div class="prose prose-sm dark:prose-invert max-w-none min-w-0 overflow-x-auto p-4 wrap-break-word">`);
			SveltePurify($$renderer, { html: mdToHTML(data.maintenance.description) });
			$$renderer.push(`<!----></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (data.maintenance.events && data.maintenance.events.length > 0) {
			$$renderer.push(`<!--[0--><div class="bg-background rounded-3xl border"><div class="flex items-center justify-between border-b p-4">`);

			Badge($$renderer, {
				variant: 'secondary',
				class: 'gap-1',
				children: ($$renderer) => {
					Calendar($$renderer, { class: 'h-3 w-3' });
					$$renderer.push(`<!----> ${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Scheduled Events (%count)", { count: String(data.maintenance.events.length) }))}`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="scrollbar-hidden max-h-96 divide-y overflow-y-auto"><!--[-->`);

			const each_array = $.ensure_array_like(data.maintenance.events);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let event = each_array[$$index];

				$$renderer.push(`<div${$.attr('data-current', event.id === data.maintenanceEvent.id)}${$.attr_class(`p-4 ${event.id === data.maintenanceEvent.id && data.maintenance.events.length > 1
					? 'bg-maintenance/10 border-l-maintenance border-l-4'
					: ''}`)}><div class="mb-2 flex items-center justify-between gap-2"><div class="flex items-center gap-2">`);

				Badge($$renderer, {
					class: getEventStatusBadgeClass(event.status),
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)(event.status))}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				if (event.id === data.maintenanceEvent.id) {
					$$renderer.push('<!--[0-->');

					Badge($$renderer, {
						variant: 'outline',
						class: 'text-maintenance border-maintenance text-xs',
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Current"))}`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> <span class="text-muted-foreground text-xs">${$.escape($.store_get($$store_subs ??= {}, '$formatDuration', formatDuration)(event.start_date_time, event.end_date_time))}</span></div> <div class="text-muted-foreground flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between"><span>${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(event.start_date_time, page.data.dateAndTimeFormat.datePlusTime))}</span> <span class="hidden sm:inline">→</span> <span>${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(event.end_date_time, page.data.dateAndTimeFormat.datePlusTime))}</span></div></div>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="lg:col-span-1"><div class="bg-background rounded-3xl border"><div class="flex items-center justify-between border-b p-4">`);

		Badge($$renderer, {
			variant: 'secondary',
			class: 'gap-1',
			children: ($$renderer) => {
				Monitor($$renderer, { class: 'h-3 w-3' });
				$$renderer.push(`<!----> ${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Affected Monitors (%count)", { count: String(data.affectedMonitors.length) }))}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		if (data.affectedMonitors.length === 0) {
			$$renderer.push(`<!--[0--><div class="text-muted-foreground p-8 text-center">`);
			Monitor($$renderer, { class: 'mx-auto mb-2 h-8 w-8 opacity-50' });
			$$renderer.push(`<!----> <p>${$.escape($.store_get($$store_subs ??= {}, '$t', t)("No monitors affected"))}</p></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div><!--[-->`);

			const each_array_1 = $.ensure_array_like(data.affectedMonitors);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let monitor = each_array_1[$$index_1];

				$$renderer.push(`<div class="border-b last:border-b-0">`);

				if (Item.Root) {
					$$renderer.push('<!--[-->');

					Item.Root($$renderer, {
						children: ($$renderer) => {
							if (Item.Media) {
								$$renderer.push('<!--[-->');

								Item.Media($$renderer, {
									children: ($$renderer) => {
										if (Tooltip.Root) {
											$$renderer.push('<!--[-->');

											Tooltip.Root($$renderer, {
												children: ($$renderer) => {
													if (Tooltip.Trigger) {
														$$renderer.push('<!--[-->');

														Tooltip.Trigger($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<div${$.attr_class(`bg-${$.stringify(monitor.monitor_impact.toLowerCase())} h-6 w-6 rounded-full`)}></div>`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Tooltip.Content) {
														$$renderer.push('<!--[-->');

														Tooltip.Content($$renderer, {
															arrowClasses: 'bg-foreground',
															children: ($$renderer) => {
																$$renderer.push(`<div class="text-xs font-medium">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Under Maintenance"))}</div>`);
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
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Item.Content) {
								$$renderer.push('<!--[-->');

								Item.Content($$renderer, {
									children: ($$renderer) => {
										if (Item.Title) {
											$$renderer.push('<!--[-->');

											Item.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(monitor.monitor_name)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Item.Description) {
											$$renderer.push('<!--[-->');

											Item.Description($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<span${$.attr_class(`text-${$.stringify(monitor.monitor_impact.toLowerCase())}`)}>${$.escape($.store_get($$store_subs ??= {}, '$t', t)(monitor.monitor_impact))}</span>`);
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

							$$renderer.push(` `);

							if (Item.Actions) {
								$$renderer.push('<!--[-->');

								Item.Actions($$renderer, {
									children: ($$renderer) => {
										Button($$renderer, {
											variant: 'outline',
											class: 'rounded-btn',
											href: clientResolver(resolve, `/monitors/${monitor.monitor_tag}`),
											size: 'icon',
											children: ($$renderer) => {
												ArrowRight($$renderer, { class: 'h-4 w-4' });
											},
											$$slots: { default: true }
										});
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

				$$renderer.push(`</div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div></div> <div class="container mx-auto px-4 py-8"><div class="my-4 flex justify-end gap-2"></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}