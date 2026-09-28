import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Badge from '$lib/components/ui/badge.svelte';
import Button from '$lib/components/ui/button.svelte';
import Bell from '@lucide/svelte/icons/bell';
import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

const Dot = ($$anchor, $$arg0) => {
	let className = $.derived_safe_equal(() => $.fallback($$arg0?.(), ''));
	var svg = root();

	$.template_effect(() => $.set_class(svg, 0, $.clsx($.get(className))));
	$.append($$anchor, svg);
};

var root = $.from_svg(`<svg width="6" height="6" fill="currentColor" viewBox="0 0 6 6" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="3" cy="3" r="3"></circle></svg>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<button class="text-xs font-medium hover:underline">Mark all as read</button>`);
var root_3 = $.from_html(`<div class="absolute end-0 self-center"><span class="sr-only">Unread</span> <!></div>`);
var root_4 = $.from_html(`<div class="hover:bg-accent rounded-md px-3 py-2 text-sm transition-colors"><div class="relative flex items-start pe-3"><div class="flex-1 space-y-1"><button class="text-foreground/80 text-left after:absolute after:inset-0"><span class="text-foreground font-medium hover:underline"> </span> <span class="text-foreground font-medium hover:underline"> </span> .</button> <div class="text-muted-foreground text-xs"> </div></div> <!></div></div>`);
var root_5 = $.from_html(`<div class="flex items-baseline justify-between gap-4 px-3 py-2"><div class="text-sm font-semibold">Notifications</div> <!></div> <div role="separator" aria-orientation="horizontal" class="bg-border -mx-1 my-1 h-px"></div> <!>`, 1);

export default function Popover_02($$anchor, $$props) {
	$.push($$props, true);

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

	let notifications = $.state($.proxy(initialNotifications));
	const unreadCount = $.derived(() => $.get(notifications).filter((n) => n.unread).length);

	function handleMarkAllAsRead() {
		$.set(
			notifications,
			$.get(notifications).map((n) => {
				n.unread = false;

				return n;
			}),
			true
		);
	}

	function handleNotificationClick(id) {
		$.set(
			notifications,
			$.get(notifications).map((n) => {
				if (n.id === id) {
					n.unread = false;
				}

				return n;
			}),
			true
		);
	}

	Popover($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props(
						{
							size: 'icon',
							variant: 'outline',
							class: 'relative',
							'aria-label': 'Open notifications'
						},
						props,
						{
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_1();
								var node_1 = $.first_child(fragment_3);

								Bell(node_1, { size: 16, 'aria-hidden': 'true' });

								var node_2 = $.sibling(node_1, 2);

								{
									var consequent = ($$anchor) => {
										Badge($$anchor, {
											class: 'absolute -top-2 left-full min-w-5 -translate-x-1/2 px-1',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text();

												$.template_effect(() => $.set_text(text, $.get(unreadCount) > 99 ? '99+' : $.get(unreadCount)));
												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									};

									$.if(node_2, ($$render) => {
										if ($.get(unreadCount) > 0) $$render(consequent);
									});
								}

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						}
					));
				};

				PopoverTrigger(node, { child, $$slots: { child: true } });
			}

			var node_3 = $.sibling(node, 2);

			PopoverContent(node_3, {
				class: 'w-80 p-1',
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_5();
					var div = $.first_child(fragment_6);
					var node_4 = $.sibling($.child(div), 2);

					{
						var consequent_1 = ($$anchor) => {
							var button = root_2();

							$.delegated('click', button, handleMarkAllAsRead);
							$.append($$anchor, button);
						};

						$.if(node_4, ($$render) => {
							if ($.get(unreadCount) > 0) $$render(consequent_1);
						});
					}

					$.reset(div);

					var node_5 = $.sibling(div, 4);

					$.each(node_5, 17, () => $.get(notifications), (notification) => notification.id, ($$anchor, notification) => {
						var div_1 = root_4();
						var div_2 = $.child(div_1);
						var div_3 = $.child(div_2);
						var button_1 = $.child(div_3);
						var span = $.child(button_1);
						var text_1 = $.only_child(span, true);
						var text_2 = $.sibling(span);
						var span_1 = $.sibling(text_2);
						var text_3 = $.only_child(span_1, true);

						$.next();
						$.reset(button_1);

						var div_4 = $.sibling(button_1, 2);
						var text_4 = $.only_child(div_4, true);

						$.reset(div_3);

						var node_6 = $.sibling(div_3, 2);

						{
							var consequent_2 = ($$anchor) => {
								var div_5 = root_3();
								var node_7 = $.sibling($.child(div_5), 2);

								Dot(node_7);
								$.reset(div_5);
								$.append($$anchor, div_5);
							};

							$.if(node_6, ($$render) => {
								if ($.get(notification).unread) $$render(consequent_2);
							});
						}

						$.reset(div_2);
						$.reset(div_1);

						$.template_effect(() => {
							$.set_text(text_1, $.get(notification).user);
							$.set_text(text_2, ` ${$.get(notification).action ?? ''} `);
							$.set_text(text_3, $.get(notification).target);
							$.set_text(text_4, $.get(notification).timestamp);
						});

						$.delegated('click', button_1, () => handleNotificationClick($.get(notification).id));
						$.append($$anchor, div_1);
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);