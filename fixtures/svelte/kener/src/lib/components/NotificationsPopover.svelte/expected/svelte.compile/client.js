import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import NotificationsList from "$lib/components/NotificationsList.svelte";
import { Button } from "$lib/components/ui/button/index.js";
import * as Popover from "$lib/components/ui/popover/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { requestNotifications } from "$lib/client/notifications-client.js";
import ICONS from "$lib/icons";
import { t } from "$lib/stores/i18n";
import { onMount } from "svelte";

var root = $.from_html(`<span class="bg-accent-foreground text-accent absolute -top-1 -right-1 min-w-4 rounded-full px-1 text-[10px] leading-4"> </span>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function NotificationsPopover($$anchor, $$props) {
	$.push($$props, true);

	const $t = () => $.store_get(t, '$t', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let monitorTags = $.prop($$props, 'monitorTags', 19, () => []),
		compact = $.prop($$props, 'compact', 3, true),
		eventsPath = $.prop($$props, 'eventsPath', 3, "");

	let open = $.state(false);
	let notifications = $.state($.proxy([]));
	let loading = $.state(false);

	async function fetchNotifications() {
		$.set(loading, true);

		try {
			$.set(notifications, await requestNotifications(monitorTags()), true);
		} catch {
			// silently fail
		} finally {
			$.set(loading, false);
		}
	}

	onMount(() => {
		void fetchNotifications();
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						{
							let $0 = $.derived(() => compact() ? "icon-sm" : "sm");
							let $1 = $.derived(() => $t()("Notifications"));

							Button($$anchor, $.spread_props(props, {
								variant: 'outline',
								get size() {
									return $.get($0);
								},
								class: 'bg-background/80 dark:bg-background/70 border-foreground/10 relative mr-2 rounded-full border text-xs shadow-none backdrop-blur-md',
								get 'aria-label'() {
									return $.get($1);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_2 = $.first_child(fragment_3);

									{
										var consequent = ($$anchor) => {
											Spinner($$anchor, { class: 'h-4 w-4' });
										};

										var alternate = ($$anchor) => {
											var fragment_5 = root_1();
											var node_3 = $.first_child(fragment_5);

											$.component(node_3, () => ICONS.Bell, ($$anchor, ICONS_Bell) => {
												ICONS_Bell($$anchor, { class: 'h-4 w-4' });
											});

											var node_4 = $.sibling(node_3, 2);

											{
												var consequent_1 = ($$anchor) => {
													var span = root();
													var text = $.only_child(span, true);

													$.template_effect(() => $.set_text(text, $.get(notifications).length));
													$.append($$anchor, span);
												};

												$.if(node_4, ($$render) => {
													if ($.get(notifications).length > 0) $$render(consequent_1);
												});
											}

											$.append($$anchor, fragment_5);
										};

										$.if(node_2, ($$render) => {
											if ($.get(loading)) $$render(consequent); else $$render(alternate, -1);
										});
									}

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							}));
						}
					};

					$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						align: 'end',
						class: 'bg-background/30 supports-backdrop-filter:bg-background/20 w-96 rounded-3xl border   p-0 shadow-2xl backdrop-blur-2xl',
						sideOffset: 8,
						children: ($$anchor, $$slotProps) => {
							NotificationsList($$anchor, {
								get monitorTags() {
									return monitorTags();
								},

								get eventsPath() {
									return eventsPath();
								},
								fetchOnMount: false,
								get notifications() {
									return $.get(notifications);
								},

								set notifications($$value) {
									$.set(notifications, $$value, true);
								},

								get loading() {
									return $.get(loading);
								},

								set loading($$value) {
									$.set(loading, $$value, true);
								}
							});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}