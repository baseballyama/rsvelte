import * as $ from 'svelte/internal/server';
import { browser } from "$app/environment";
import { buttonVariants } from "$lib/components/ui/button/index.js";
import * as Drawer from "$lib/components/ui/drawer/index.js";
import { requestMonitorBar } from "$lib/client/monitor-bar-client";
import MonitorBar from "$lib/components/MonitorBar.svelte";
import { t } from "$lib/stores/i18n";

export default function GroupMonitorPopover($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { tags, days, endOfDayTodayAtTz, children } = $$props;
		let isOpen = false;

		let monitorBarPromiseByTag = $.derived(() => {
			if (!browser || !isOpen || tags.length === 0) {
				return {};
			}

			return Object.fromEntries(tags.map((tag) => [tag, requestMonitorBar(tag, days, endOfDayTodayAtTz)]));
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="w-full">`);

			if (Drawer.Root) {
				$$renderer.push('<!--[-->');

				Drawer.Root($$renderer, {
					direction: 'bottom',
					get open() {
						return isOpen;
					},

					set open($$value) {
						isOpen = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Drawer.Trigger) {
							$$renderer.push('<!--[-->');

							Drawer.Trigger($$renderer, {
								class: buttonVariants({
									variant: "ghost",
									size: "sm",
									class: "rounded-btn bg-secondary w-full   text-xs"
								}),

								children: ($$renderer) => {
									children($$renderer);
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

						if (Drawer.Content) {
							$$renderer.push('<!--[-->');

							Drawer.Content($$renderer, {
								class: 'max-h-[80vh]',
								children: ($$renderer) => {
									if (Drawer.Header) {
										$$renderer.push('<!--[-->');

										Drawer.Header($$renderer, {
											children: ($$renderer) => {
												if (Drawer.Title) {
													$$renderer.push('<!--[-->');

													Drawer.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Included Monitors (%count)", { count: String(tags.length) }))}`);
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

									$$renderer.push(` <div class="scrollbar-hidden flex flex-col overflow-y-auto px-4 pb-4">`);

									if (tags.length === 0) {
										$$renderer.push(`<!--[0--><div class="text-muted-foreground p-4 text-sm">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("No monitors available."))}</div>`);
									} else {
										$$renderer.push(`<!--[-1--><!--[-->`);

										const each_array = $.ensure_array_like(tags);

										for (let i = 0, $$length = each_array.length; i < $$length; i++) {
											let tag = each_array[i];

											$$renderer.push(`<div${$.attr_class(`${i < tags.length - 1 ? 'border-b' : ''} py-2 pb-4`)}>`);

											if (monitorBarPromiseByTag()[tag]) {
												$$renderer.push('<!--[0-->');

												$.await(
													$$renderer,
													monitorBarPromiseByTag()[tag],
													() => {
														MonitorBar($$renderer, { tag });
													},
													(monitorBarData) => {
														MonitorBar($$renderer, { tag, prefetchedData: monitorBarData });
													}
												);

												$$renderer.push(`<!--]-->`);
											} else {
												$$renderer.push('<!--[-1-->');
												MonitorBar($$renderer, { tag });
											}

											$$renderer.push(`<!--]--></div>`);
										}

										$$renderer.push(`<!--]-->`);
									}

									$$renderer.push(`<!--]--></div>`);
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}