import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fly } from 'svelte/transition';
import { Layout, Toast } from '@appwrite.io/pink-svelte';
import { dismissNotification, notifications } from '../stores/notifications';

var root = $.from_html(`<span><!></span>`);
var root_1 = $.from_html(`<section class="svelte-brvo36"><!></section>`);

export default function Notifications($$anchor, $$props) {
	$.push($$props, true);

	const $notifications = () => $.store_get(notifications, '$notifications', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var section = root_1();
			var node_1 = $.child(section);

			$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					gap: 's',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						$.each(node_2, 1, $notifications, (notification) => notification.id, ($$anchor, notification) => {
							var span = root();
							var node_3 = $.child(span);

							{
								let $0 = $.derived(() => $.get(notification).buttons?.map((button) => {
									return {
										label: button.name,
										onClick: button.method,
										isHtml: button.isHtml
									};
								}));

								Toast(node_3, {
									get isHtml() {
										return $.get(notification).isHtml;
									},

									get title() {
										return $.get(notification).title;
									},

									get status() {
										return $.get(notification).type;
									},

									get icon() {
										return $.get(notification).icon;
									},

									get description() {
										return $.get(notification).message;
									},

									get actions() {
										return $.get($0);
									},
									$$events: { dismiss: () => dismissNotification($.get(notification).id) }
								});
							}

							$.reset(span);
							$.transition(7, span, () => fly, () => ({ x: 50 }));
							$.append($$anchor, span);
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			$.reset(section);
			$.append($$anchor, section);
		};

		$.if(node, ($$render) => {
			if ($notifications()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}