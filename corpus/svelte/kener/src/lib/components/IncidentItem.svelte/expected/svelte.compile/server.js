import * as $ from 'svelte/internal/server';
import * as Item from "$lib/components/ui/item/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import * as Popover from "$lib/components/ui/popover/index.js";
import * as Avatar from "$lib/components/ui/avatar/index.js";
import { t } from "$lib/stores/i18n";
import { formatDate, formatDuration } from "$lib/stores/datetime";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import { GetInitials } from "$lib/clientTools.js";
import { SveltePurify } from "@humanspeak/svelte-purify";
import mdToHTML from "$lib/marked";
import { slide } from "svelte/transition";
import { page } from "$app/state";

export default function IncidentItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			incident,
			class: className = "",
			hideMonitors = false,
			showComments = true,
			showSummary = true
		} = $$props;

		// Calculate duration between start and end (or now if ongoing)
		// If ongoing, use current timestamp for duration calculation
		const endTimeForDuration = $.derived(() => incident.end_date_time ?? Math.floor(Date.now() / 1000));

		const isEmbedded = page.route.id?.includes("(embed)");
		const target = isEmbedded ? "_blank" : "_self";

		if (Item.Root) {
			$$renderer.push('<!--[-->');

			Item.Root($$renderer, {
				class: `items-start  p-0 ${$.stringify(className)} sm:items-center`,
				children: ($$renderer) => {
					if (Item.Content) {
						$$renderer.push('<!--[-->');

						Item.Content($$renderer, {
							class: 'min-w-0 flex-1',
							children: ($$renderer) => {
								$$renderer.push(`<div class="flex flex-col items-start justify-start gap-0.5"><span${$.attr_class(`text-xs font-medium text-${$.stringify(incident.state.toLowerCase())}`)}>${$.escape($.store_get($$store_subs ??= {}, '$t', t)(incident.state))}</span> `);

								if (Item.Title) {
									$$renderer.push('<!--[-->');

									Item.Title($$renderer, {
										class: 'min-w-0 text-base wrap-break-word break-all',
										children: ($$renderer) => {
											$$renderer.push(`<a${$.attr('target', target)} class="hover:underline"${$.attr('href', clientResolver(resolve, `/incidents/${incident.id}`))}>${$.escape(incident.title)}</a>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(`</div> `);

								if (incident.monitors && incident.monitors.length > 0 && !hideMonitors) {
									$$renderer.push(`<!--[0--><div class="my-1 p-1"><div class="flex flex-wrap gap-2"><!--[-->`);

									const each_array = $.ensure_array_like(incident.monitors);

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
															class: 'bg-background/60 border-border w-64 rounded-3xl border shadow-2xl backdrop-blur-xl',
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

									$$renderer.push(`<!--]--></div></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								if (Item.Description) {
									$$renderer.push('<!--[-->');

									Item.Description($$renderer, {
										class: 'mt-2 flex w-full flex-col gap-2 text-xs font-medium sm:flex-row sm:items-center sm:justify-between',
										children: ($$renderer) => {
											$$renderer.push(`<span class="max-w-full rounded-full border px-3 py-2 wrap-break-word">${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(incident.start_date_time, page.data.dateAndTimeFormat.datePlusTime))}</span> <span class="relative w-full text-center sm:flex-1"><span class="absolute top-0 bottom-0 left-1/2 border-l sm:top-1/2 sm:right-0 sm:bottom-auto sm:left-0 sm:border-t sm:border-l-0"></span> <span class="bg-background relative z-10 rounded-full px-0 py-1 sm:px-2">${$.escape($.store_get($$store_subs ??= {}, '$formatDuration', formatDuration)(incident.start_date_time, endTimeForDuration()))}</span></span> `);

											if (incident.end_date_time) {
												$$renderer.push(`<!--[0--><span class="max-w-full rounded-full border px-3 py-2 wrap-break-word">${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(incident.end_date_time, page.data.dateAndTimeFormat.datePlusTime))}</span>`);
											} else {
												$$renderer.push(`<!--[-1--><span class="max-w-full rounded-full border px-3 py-2 wrap-break-word">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Ongoing"))}</span>`);
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

								if (showSummary) {
									$$renderer.push(`<!--[0--><div class="my-2 grid grid-cols-1 gap-4 text-xs font-medium sm:grid-cols-3"><div class="text-muted-foreground bg-secondary flex items-center justify-between rounded-full border p-2 px-4"><span>${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Last Updated"))}</span> <span>${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(incident.updated_at, page.data.dateAndTimeFormat.datePlusTime))}</span></div> <div class="text-muted-foreground bg-secondary flex items-center justify-between rounded-full border p-2 px-4"><span>${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Status"))}</span> <div class="flex items-center gap-2"><span${$.attr_class(`text-${$.stringify(incident.state.toLowerCase())}`)}>${$.escape($.store_get($$store_subs ??= {}, '$t', t)(incident.state))}</span></div></div> <div class="text-muted-foreground bg-secondary flex items-center justify-between gap-2 rounded-full border p-2 px-4"><span>${$.escape(incident.comments && incident.comments.length > 0
										? `${incident.comments.length} ${$.store_get($$store_subs ??= {}, '$t', t)("Updates")}`
										: $.store_get($$store_subs ??= {}, '$t', t)("No Updates"))}</span> `);

									Button($$renderer, {
										variant: 'outline',
										size: 'icon-sm',
										class: `rounded-btn -mr-2 ${isEmbedded ? 'hidden' : ''}`,
										onclick: () => showComments = !showComments,
										children: ($$renderer) => {
											ArrowRight($$renderer, {
												class: `transition-transform duration-200 ${showComments ? "rotate-90" : ""}`
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								if (showSummary && showComments && incident.comments && incident.comments.length > 0) {
									$$renderer.push(`<!--[0--><div class="flex flex-col gap-4"><!--[-->`);

									const each_array_1 = $.ensure_array_like(incident.comments);

									for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
										let comment = each_array_1[$$index_1];

										$$renderer.push(`<div class="flex flex-col gap-2 border-b pb-4 last:border-b-0 last:pb-0"><div class="flex justify-start gap-2">`);

										Badge($$renderer, {
											variant: 'outline',
											class: `text-${$.stringify(comment.state.toLowerCase())} rounded-none border-0 p-0`,
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)(comment.state))}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <span class="text-muted-foreground text-xs">${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(comment.commented_at, page.data.dateAndTimeFormat.datePlusTime))}</span></div> <div class="prose prose-sm dark:prose-invert max-w-none min-w-0 overflow-x-auto wrap-break-word" style="font-size: 14px;">`);
										SveltePurify($$renderer, { html: mdToHTML(comment.comment) });
										$$renderer.push(`<!----></div></div>`);
									}

									$$renderer.push(`<!--]--></div>`);
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}