import * as $ from 'svelte/internal/server';
import Badge from '$lib/components/ui/badge.svelte';
import Button from '$lib/components/ui/button.svelte';
import Bell from '@lucide/svelte/icons/bell';
import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

function Dot($$renderer, className = '') {
	$$renderer.push(`<svg width="6" height="6" fill="currentColor" viewBox="0 0 6 6" xmlns="http://www.w3.org/2000/svg"${$.attr_class($.clsx(className))} aria-hidden="true"><circle cx="3" cy="3" r="3"></circle></svg>`);
}

export default function Popover_02($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const initialNotifications = [
			{
				action: 'requested review on',
				id: 1,
				target: 'PR #42: Feature implementation',
				timestamp: '15 minutes ago',
				unread: true,
				user: 'Chris Tompson'
			},

			{
				action: 'shared',
				id: 2,
				target: 'New component library',
				timestamp: '45 minutes ago',
				unread: true,
				user: 'Emma Davis'
			},

			{
				action: 'assigned you to',
				id: 3,
				target: 'API integration task',
				timestamp: '4 hours ago',
				unread: false,
				user: 'James Wilson'
			},

			{
				action: 'replied to your comment in',
				id: 4,
				target: 'Authentication flow',
				timestamp: '12 hours ago',
				unread: false,
				user: 'Alex Morgan'
			},

			{
				action: 'commented on',
				id: 5,
				target: 'Dashboard redesign',
				timestamp: '2 days ago',
				unread: false,
				user: 'Sarah Chen'
			},

			{
				action: 'mentioned you in',
				id: 6,
				target: 'Origin UI open graph image',
				timestamp: '2 weeks ago',
				unread: false,
				user: 'Miky Derya'
			}
		];

		let notifications = initialNotifications;
		const unreadCount = $.derived(() => notifications.filter((n) => n.unread).length);

		function handleMarkAllAsRead() {
			notifications = notifications.map((n) => {
				n.unread = false;

				return n;
			});
		}

		function handleNotificationClick(id) {
			notifications = notifications.map((n) => {
				if (n.id === id) {
					n.unread = false;
				}

				return n;
			});
		}

		Popover($$renderer, {
			children: ($$renderer) => {
				{
					function child($$renderer, { props }) {
						Button($$renderer, $.spread_props([
							{
								size: 'icon',
								variant: 'outline',
								class: 'relative',
								'aria-label': 'Open notifications'
							},
							props,
							{
								children: ($$renderer) => {
									Bell($$renderer, { size: 16, 'aria-hidden': 'true' });
									$$renderer.push(`<!----> `);

									if (unreadCount() > 0) {
										$$renderer.push('<!--[0-->');

										Badge($$renderer, {
											class: 'absolute -top-2 left-full min-w-5 -translate-x-1/2 px-1',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(unreadCount() > 99 ? '99+' : unreadCount())}`);
											},
											$$slots: { default: true }
										});
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							}
						]));
					}

					PopoverTrigger($$renderer, { child, $$slots: { child: true } });
				}

				$$renderer.push(`<!----> `);

				PopoverContent($$renderer, {
					class: 'w-80 p-1',
					children: ($$renderer) => {
						$$renderer.push(`<div class="flex items-baseline justify-between gap-4 px-3 py-2"><div class="text-sm font-semibold">Notifications</div> `);

						if (unreadCount() > 0) {
							$$renderer.push(`<!--[0--><button class="text-xs font-medium hover:underline">Mark all as read</button>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> <div role="separator" aria-orientation="horizontal" class="bg-border -mx-1 my-1 h-px"></div> <!--[-->`);

						const each_array = $.ensure_array_like(notifications);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let notification = each_array[$$index];

							$$renderer.push(`<div class="hover:bg-accent rounded-md px-3 py-2 text-sm transition-colors"><div class="relative flex items-start pe-3"><div class="flex-1 space-y-1"><button class="text-foreground/80 text-left after:absolute after:inset-0"><span class="text-foreground font-medium hover:underline">${$.escape(notification.user)}</span> ${$.escape(notification.action)} <span class="text-foreground font-medium hover:underline">${$.escape(notification.target)}</span> .</button> <div class="text-muted-foreground text-xs">${$.escape(notification.timestamp)}</div></div> `);

							if (notification.unread) {
								$$renderer.push(`<!--[0--><div class="absolute end-0 self-center"><span class="sr-only">Unread</span> `);
								Dot($$renderer);
								$$renderer.push(`<!----></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div></div>`);
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}