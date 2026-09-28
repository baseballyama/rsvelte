import * as $ from 'svelte/internal/server';
import { fly } from 'svelte/transition';
import { Layout, Toast } from '@appwrite.io/pink-svelte';
import { dismissNotification, notifications } from '../stores/notifications';

export default function Notifications($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		if ($.store_get($$store_subs ??= {}, '$notifications', notifications)) {
			$$renderer.push(`<!--[0--><section class="svelte-brvo36">`);

			if (Layout.Stack) {
				$$renderer.push('<!--[-->');

				Layout.Stack($$renderer, {
					gap: 's',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$notifications', notifications));

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let notification = each_array[$$index];

							$$renderer.push(`<span>`);

							Toast($$renderer, {
								isHtml: notification.isHtml,
								title: notification.title,
								status: notification.type,
								icon: notification.icon,
								description: notification.message,
								actions: notification.buttons?.map((button) => {
									return {
										label: button.name,
										onClick: button.method,
										isHtml: button.isHtml
									};
								})
							});

							$$renderer.push(`<!----></span>`);
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

			$$renderer.push(`</section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}