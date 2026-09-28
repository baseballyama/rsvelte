import * as $ from 'svelte/internal/server';
import NotificationsList from "$lib/components/NotificationsList.svelte";
import { Button } from "$lib/components/ui/button/index.js";
import * as Popover from "$lib/components/ui/popover/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { requestNotifications } from "$lib/client/notifications-client.js";
import ICONS from "$lib/icons";
import { t } from "$lib/stores/i18n";
import { onMount } from "svelte";

export default function NotificationsPopover($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { monitorTags = [], compact = true, eventsPath = "" } = $$props;
		let open = false;
		let notifications = [];
		let loading = false;

		async function fetchNotifications() {
			loading = true;

			try {
				notifications = await requestNotifications(monitorTags);
			} catch {
				// silently fail
			} finally {
				loading = false;
			}
		}

		onMount(() => {
			void fetchNotifications();
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Popover.Root) {
				$$renderer.push('<!--[-->');

				Popover.Root($$renderer, {
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									props,
									{
										variant: 'outline',
										size: compact ? "icon-sm" : "sm",
										class: 'bg-background/80 dark:bg-background/70 border-foreground/10 relative mr-2 rounded-full border text-xs shadow-none backdrop-blur-md',
										'aria-label': $.store_get($$store_subs ??= {}, '$t', t)("Notifications"),
										children: ($$renderer) => {
											if (loading) {
												$$renderer.push('<!--[0-->');
												Spinner($$renderer, { class: 'h-4 w-4' });
											} else {
												$$renderer.push('<!--[-1-->');

												if (ICONS.Bell) {
													$$renderer.push('<!--[-->');
													ICONS.Bell($$renderer, { class: 'h-4 w-4' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (notifications.length > 0) {
													$$renderer.push(`<!--[0--><span class="bg-accent-foreground text-accent absolute -top-1 -right-1 min-w-4 rounded-full px-1 text-[10px] leading-4">${$.escape(notifications.length)}</span>`);
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]-->`);
											}

											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Popover.Trigger) {
								$$renderer.push('<!--[-->');
								Popover.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Popover.Content) {
							$$renderer.push('<!--[-->');

							Popover.Content($$renderer, {
								align: 'end',
								class: 'bg-background/30 supports-backdrop-filter:bg-background/20 w-96 rounded-3xl border   p-0 shadow-2xl backdrop-blur-2xl',
								sideOffset: 8,
								children: ($$renderer) => {
									NotificationsList($$renderer, {
										monitorTags,
										eventsPath,
										fetchOnMount: false,
										get notifications() {
											return notifications;
										},

										set notifications($$value) {
											notifications = $$value;
											$$settled = false;
										},

										get loading() {
											return loading;
										},

										set loading($$value) {
											loading = $$value;
											$$settled = false;
										}
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