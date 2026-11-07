import * as $ from 'svelte/internal/server';
import * as Item from "$lib/components/ui/item/index.js";
import { Skeleton } from "$lib/components/ui/skeleton/index.js";
import * as Avatar from "$lib/components/ui/avatar/index.js";
import ICONS from "$lib/icons";
import StatusBarCalendar from "$lib/components/StatusBarCalendar.svelte";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import { formatDate } from "$lib/stores/datetime";
import { GetInitials } from "$lib/clientTools.js";
import GroupMonitorPopover from "./GroupMonitorPopover.svelte";
import { t } from "$lib/stores/i18n";
import { page } from "$app/state";

export default function MonitorBar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			tag,
			prefetchedData,
			prefetchedError,
			groupChildTags = [],
			days,
			endOfDayTodayAtTz,
			compact = false,
			grid = false
		} = $$props;

		let data = $.derived(() => prefetchedData ?? null);
		let error = $.derived(() => prefetchedError ?? null);
		let loading = $.derived(() => !data() && !error());
		let showGroupPopover = $.derived(() => groupChildTags.length > 0 && typeof days === "number" && typeof endOfDayTodayAtTz === "number");

		const STATUS_ICON = {
			UP: ICONS.UP,
			DOWN: ICONS.DOWN,
			DEGRADED: ICONS.DEGRADED,
			MAINTENANCE: ICONS.MAINTENANCE,
			NO_DATA: ICONS.MAINTENANCE
		};

		const STATUS_STROKE = {
			UP: "stroke-up",
			DOWN: "stroke-down",
			DEGRADED: "stroke-degraded",
			MAINTENANCE: "stroke-maintenance",
			NO_DATA: "stroke-muted-foreground"
		};

		$$renderer.push(`<div>`);

		if (loading()) {
			$$renderer.push('<!--[0-->');

			if (Item.Root) {
				$$renderer.push('<!--[-->');

				Item.Root($$renderer, {
					class: 'items-start sm:items-center',
					children: ($$renderer) => {
						if (!compact) {
							$$renderer.push('<!--[0-->');

							if (Item.Media) {
								$$renderer.push('<!--[-->');

								Item.Media($$renderer, {
									variant: 'image',
									children: ($$renderer) => {
										Skeleton($$renderer, { class: 'size-8 rounded' });
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (Item.Content) {
							$$renderer.push('<!--[-->');

							Item.Content($$renderer, {
								class: 'min-w-0 flex-1',
								children: ($$renderer) => {
									Skeleton($$renderer, { class: 'mb-2 h-5 w-full' });
									$$renderer.push(`<!----> `);
									Skeleton($$renderer, { class: 'h-4 w-full' });
									$$renderer.push(`<!---->`);
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
								class: 'order-3 w-full text-left sm:order-0 sm:w-auto sm:flex-none sm:text-center',
								children: ($$renderer) => {
									Skeleton($$renderer, { class: 'h-8 w-full' });
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

			if (!compact) {
				$$renderer.push(`<!--[0--><div class="mx-auto flex w-full flex-col gap-1 px-4"><div class="flex justify-end overflow-hidden rounded-full"><!--[-->`);

				const each_array = $.ensure_array_like(Array(54));

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let _ = each_array[i];

					Skeleton($$renderer, {
						class: `h-4 w-4 shrink-0 ${i === 0 ? 'rounded-tl-full rounded-bl-full' : ''} ${i === 53 ? 'rounded-tr-full rounded-br-full' : ''}`
					});
				}

				$$renderer.push(`<!--]--></div> <div class="flex justify-end">`);
				Skeleton($$renderer, { class: 'h-3 w-32' });
				$$renderer.push(`<!----></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else if (error()) {
			$$renderer.push(`<!--[1--><div class="text-destructive p-4 text-center"><p>Failed to load monitor: ${$.escape(error())}</p></div>`);
		} else if (data()) {
			$$renderer.push('<!--[2-->');

			const StatusIcon = STATUS_ICON[data().currentStatus];

			if (Item.Root) {
				$$renderer.push('<!--[-->');

				Item.Root($$renderer, {
					class: 'items-start ',
					children: ($$renderer) => {
						if (!compact) {
							$$renderer.push('<!--[0-->');

							if (Item.Media) {
								$$renderer.push('<!--[-->');

								Item.Media($$renderer, {
									variant: 'image',
									class: 'hidden sm:block',
									children: ($$renderer) => {
										if (Avatar.Root) {
											$$renderer.push('<!--[-->');

											Avatar.Root($$renderer, {
												class: 'size-10',
												children: ($$renderer) => {
													if (data().image) {
														$$renderer.push('<!--[0-->');

														if (Avatar.Image) {
															$$renderer.push('<!--[-->');

															Avatar.Image($$renderer, {
																src: clientResolver(resolve, data().image),
																alt: data().name,
																class: '  '
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--> `);

													if (Avatar.Fallback) {
														$$renderer.push('<!--[-->');

														Avatar.Fallback($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(GetInitials(data().name))}`);
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
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (Item.Content) {
							$$renderer.push('<!--[-->');

							Item.Content($$renderer, {
								class: 'min-w-0 flex-1',
								children: ($$renderer) => {
									if (Item.Title) {
										$$renderer.push('<!--[-->');

										Item.Title($$renderer, {
											class: 'w-full truncate',
											children: ($$renderer) => {
												$$renderer.push(`<a class="hover:underline"${$.attr('href', clientResolver(resolve, `/monitors/${tag}`))}>${$.escape(data().name)}</a>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (data().description) {
										$$renderer.push('<!--[0-->');

										if (Item.Description) {
											$$renderer.push('<!--[-->');

											Item.Description($$renderer, {
												class: 'line-clamp-2 wrap-break-word',
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(data().description)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
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

						$$renderer.push(` `);

						if (Item.Content) {
							$$renderer.push('<!--[-->');

							Item.Content($$renderer, {
								class: 'order-3 w-full text-left sm:order-0 sm:w-auto sm:flex-none sm:text-center',
								children: ($$renderer) => {
									if (Item.Title) {
										$$renderer.push('<!--[-->');

										Item.Title($$renderer, {
											class: 'items-start text-2xl',
											children: ($$renderer) => {
												if (StatusIcon) {
													$$renderer.push('<!--[-->');

													StatusIcon($$renderer, {
														class: `${$.stringify(STATUS_STROKE[data().currentStatus])} ${grid ? 'mt-1 size-5' : 'mt-1.5 size-6'}`
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` <div class="flex flex-col items-start gap-1 sm:items-end"><span${$.attr_class($.clsx(grid ? "text-base sm:text-lg" : "text-lg sm:text-xl"))}>${$.escape(data().uptime)}%</span> <span class="text-muted-foreground text-right text-xs">${$.escape(data().avgLatency)}</span></div>`);
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

			if (!compact) {
				$$renderer.push(`<!--[0--><div class="mx-auto flex w-full flex-col gap-1 px-4">`);

				StatusBarCalendar($$renderer, {
					data: data().uptimeData,
					monitorTag: tag,
					barHeight: 40,
					radius: 8
				});

				$$renderer.push(`<!----> <div class="flex min-w-0 justify-between gap-3"><p class="text-muted-foreground min-w-0 truncate text-xs font-medium">${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(new Date(data().fromTimeStamp * 1000), page.data.dateAndTimeFormat.dateOnly))}</p> <p class="text-muted-foreground min-w-0 truncate text-right text-xs font-medium">${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(new Date(data().toTimeStamp * 1000), page.data.dateAndTimeFormat.dateOnly))}</p></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (showGroupPopover()) {
				$$renderer.push(`<!--[0--><div class="mt-2 flex justify-center gap-2 px-4">`);

				GroupMonitorPopover($$renderer, {
					tags: groupChildTags,
					days,
					endOfDayTodayAtTz,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Included Monitors (%count)", { count: String(groupChildTags.length) }))}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}