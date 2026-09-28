import * as $ from 'svelte/internal/server';
import { resolve } from "$app/paths";
import MessageSquare from "@lucide/svelte/icons/message-square";
import Monitor from "@lucide/svelte/icons/monitor";
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import * as Item from "$lib/components/ui/item/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import * as Tooltip from "$lib/components/ui/tooltip/index.js";
import mdToHTML from "$lib/marked";
import ThemePlus from "$lib/components/ThemePlus.svelte";
import { SveltePurify } from "@humanspeak/svelte-purify";
import { t } from "$lib/stores/i18n";
import { formatDate, formatDuration } from "$lib/stores/datetime";
import clientResolver, { absoluteResolve } from "$lib/client/resolver.js";
import { page } from "$app/state";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;

		$.head('115s2d4', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(data.incident.title + " - " + data.siteName)}</title>`);
			});

			$$renderer.push(`<meta property="og:title"${$.attr('content', data.incident.title + " - " + data.siteName)}/> <meta property="og:type" content="article"/> <meta name="twitter:card" content="summary_large_image"/> `);

			if (data.comments.length > 0) {
				$$renderer.push(`<!--[0--><meta name="description"${$.attr('content', data.comments[0].comment)}/> <meta property="og:description"${$.attr('content', data.comments[0].comment)}/>`);
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
				class: 'mb-4 px-0',
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
											$$renderer.push(`<!---->${$.escape(data.incident.title)}`);
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

		$$renderer.push(`</div> <div class="grid min-w-0 gap-6 lg:grid-cols-3"><div class="min-w-0 lg:col-span-2"><div class="bg-background min-w-0 rounded-3xl border"><div class="flex items-center justify-between border-b p-4">`);

		Badge($$renderer, {
			variant: 'secondary',
			class: 'gap-1',
			children: ($$renderer) => {
				MessageSquare($$renderer, { class: 'h-3 w-3' });
				$$renderer.push(`<!----> ${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Updates (%count)", { count: String(data.comments.length) }))}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		if (data.comments.length === 0) {
			$$renderer.push(`<!--[0--><div class="text-muted-foreground p-8 text-center">`);
			MessageSquare($$renderer, { class: 'mx-auto mb-2 h-8 w-8 opacity-50' });
			$$renderer.push(`<!----> <p>${$.escape($.store_get($$store_subs ??= {}, '$t', t)("No updates yet"))}</p></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="divide-y"><!--[-->`);

			const each_array = $.ensure_array_like(data.comments);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let comment = each_array[$$index];

				$$renderer.push(`<div class="min-w-0 p-4"><div class="mb-2 flex items-center justify-between gap-2">`);

				Badge($$renderer, {
					variant: 'outline',
					class: `text-${$.stringify(comment.state.toLowerCase())} rounded-none border-0 p-0`,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)(comment.state))}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <span class="text-muted-foreground text-xs">${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(comment.commented_at, page.data.dateAndTimeFormat.datePlusTime))}</span></div> <div class="prose prose-sm dark:prose-invert max-w-none min-w-0 overflow-x-auto wrap-break-word">`);
				SveltePurify($$renderer, { html: mdToHTML(comment.comment) });
				$$renderer.push(`<!----></div></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="lg:col-span-1"><div class="bg-background rounded-3xl border"><div class="flex items-center justify-between border-b p-4">`);

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
																$$renderer.push(`<div${$.attr_class(`h-6 w-6 rounded-full bg-${$.stringify(monitor.monitor_impact?.toLowerCase())}`)}></div>`);
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
																$$renderer.push(`<div class="text-xs font-medium">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Impact"))}: ${$.escape(monitor.monitor_impact || $.store_get($$store_subs ??= {}, '$t', t)("Unknown impact"))}</div>`);
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
													if (monitor.monitor_impact) {
														$$renderer.push(`<!--[0--><span${$.attr_class(`text-${$.stringify(monitor.monitor_impact.toLowerCase())}`)}>${$.escape($.store_get($$store_subs ??= {}, '$t', t)(monitor.monitor_impact))}</span>`);
													} else {
														$$renderer.push(`<!--[-1-->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Unknown impact"))}`);
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

							$$renderer.push(` `);

							if (Item.Actions) {
								$$renderer.push('<!--[-->');

								Item.Actions($$renderer, {
									children: ($$renderer) => {
										Button($$renderer, {
											variant: 'outline',
											href: clientResolver(resolve, `/monitors/${monitor.monitor_tag}`),
											class: 'rounded-btn',
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

		$$renderer.push(`<!--]--></div></div></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}