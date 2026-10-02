import * as $ from 'svelte/internal/server';
import * as Item from "$lib/components/ui/item/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import * as Popover from "$lib/components/ui/popover/index.js";
import * as Avatar from "$lib/components/ui/avatar/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import STATUS_ICON from "$lib/icons";
import { t } from "$lib/stores/i18n";
import { formatDate, formatDuration } from "$lib/stores/datetime";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import { GetInitials } from "$lib/clientTools.js";
import { SveltePurify } from "@humanspeak/svelte-purify";
import mdToHTML from "$lib/marked";
import { page } from "$app/state";

export default function MaintenanceItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { maintenance, class: className = "", hideMonitors = false } = $$props;

		// Check if maintenance is ongoing (current time is between start and end)
		const isOngoing = $.derived(() => () => {
			const now = Date.now() / 1000;

			return now >= maintenance.start_date_time && now <= maintenance.end_date_time;
		});

		const isEmbedded = page.route.id?.includes("(embed)");
		const target = isEmbedded ? "_blank" : "_self";

		if (Item.Root) {
			$$renderer.push('<!--[-->');

			Item.Root($$renderer, {
				class: `items-start p-0 ${$.stringify(className)} sm:items-center`,
				children: ($$renderer) => {
					if (Item.Content) {
						$$renderer.push('<!--[-->');

						Item.Content($$renderer, {
							class: 'min-w-0 flex-1',
							children: ($$renderer) => {
								$$renderer.push(`<div class="flex flex-col items-start justify-start gap-0.5"><span${$.attr_class(`text-xs font-medium text-${$.stringify(maintenance.status.toLowerCase())}`)}>${$.escape($.store_get($$store_subs ??= {}, '$t', t)(maintenance.status))}</span> `);

								if (Item.Title) {
									$$renderer.push('<!--[-->');

									Item.Title($$renderer, {
										class: 'min-w-0 text-base wrap-break-word break-all',
										children: ($$renderer) => {
											$$renderer.push(`<a${$.attr('target', target)} class="hover:underline"${$.attr('href', clientResolver(resolve, `/maintenances/${maintenance.id}`))}>${$.escape(maintenance.title)}</a>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(`</div> `);

								if (maintenance.description) {
									$$renderer.push(`<!--[0--><div class="prose prose-sm dark:prose-invert text-muted-foreground mt-1 max-w-none min-w-0 overflow-x-auto text-sm wrap-break-word">`);
									SveltePurify($$renderer, { html: mdToHTML(maintenance.description) });
									$$renderer.push(`<!----></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								if (maintenance.monitors && maintenance.monitors.length > 0 && !hideMonitors) {
									$$renderer.push(`<!--[0--><div class="flex flex-wrap gap-2"><!--[-->`);

									const each_array = $.ensure_array_like(maintenance.monitors);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let monitor = each_array[$$index];

										if (Popover.Root) {
											$$renderer.push('<!--[-->');

											Popover.Root($$renderer, {
												children: ($$renderer) => {
													if (Popover.Trigger) {
														$$renderer.push('<!--[-->');

														Popover.Trigger($$renderer, {
															disabled: isEmbedded,
															children: ($$renderer) => {
																Badge($$renderer, {
																	variant: 'outline',
																	class: `border-${$.stringify(monitor.monitor_impact.toLowerCase())}   max-w-full cursor-pointer rounded-none border-0 border-b px-0 text-sm font-normal wrap-anywhere whitespace-normal`,
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(monitor.monitor_name)}`);
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

													$$renderer.push(` `);

													if (Popover.Content) {
														$$renderer.push('<!--[-->');

														Popover.Content($$renderer, {
															class: 'w-64',
															children: ($$renderer) => {
																$$renderer.push(`<div class="flex flex-col gap-3"><div class="flex items-center gap-3">`);

																if (Avatar.Root) {
																	$$renderer.push('<!--[-->');

																	Avatar.Root($$renderer, {
																		children: ($$renderer) => {
																			if (monitor.monitor_image) {
																				$$renderer.push('<!--[0-->');

																				if (Avatar.Image) {
																					$$renderer.push('<!--[-->');

																					Avatar.Image($$renderer, {
																						src: clientResolver(resolve, monitor.monitor_image),
																						alt: monitor.monitor_name
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
																						$$renderer.push(`<!---->${$.escape(GetInitials(monitor.monitor_name))}`);
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

																$$renderer.push(` <div class="flex flex-col"><span class="font-medium">${$.escape(monitor.monitor_name)}</span> <span class="text-muted-foreground text-xs">${$.escape(monitor.monitor_tag)}</span></div></div> <div class="flex items-center justify-between">`);

																Badge($$renderer, {
																	variant: 'outline',
																	class: `text-${$.stringify(monitor.monitor_impact.toLowerCase())}`,
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)(monitor.monitor_impact))}`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push(`<!----> `);

																Button($$renderer, {
																	variant: 'outline',
																	class: 'rounded-btn',
																	size: 'icon-sm',
																	href: clientResolver(resolve, `/monitors/${monitor.monitor_tag}`),
																	children: ($$renderer) => {
																		ArrowRight($$renderer, { class: 'size-3' });
																	},
																	$$slots: { default: true }
																});

																$$renderer.push(`<!----></div></div>`);
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

									$$renderer.push(`<!--]--></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								if (Item.Description) {
									$$renderer.push('<!--[-->');

									Item.Description($$renderer, {
										class: 'mt-2 flex w-full flex-col gap-2 text-xs font-medium sm:flex-row sm:items-center sm:justify-between',
										children: ($$renderer) => {
											$$renderer.push(`<span class="max-w-full rounded-full border px-3 py-2 wrap-break-word">${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(maintenance.start_date_time, page.data.dateAndTimeFormat.datePlusTime))}</span> <span class="relative w-full text-center sm:flex-1"><span class="absolute top-0 bottom-0 left-1/2 border-l sm:top-1/2 sm:right-0 sm:bottom-auto sm:left-0 sm:border-t sm:border-l-0"></span> <span class="bg-background relative z-10 rounded-full px-0 py-1 sm:px-2">${$.escape($.store_get($$store_subs ??= {}, '$formatDuration', formatDuration)(maintenance.start_date_time, maintenance.end_date_time))}</span></span> <span class="max-w-full rounded-full border px-3 py-2 wrap-break-word">${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(maintenance.end_date_time, page.data.dateAndTimeFormat.datePlusTime))}</span>`);
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}