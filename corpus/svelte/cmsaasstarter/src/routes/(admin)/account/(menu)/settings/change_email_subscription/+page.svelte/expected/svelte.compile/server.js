import * as $ from 'svelte/internal/server';
import SettingsModule from "../settings_module.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let profile = $.derived(() => data.profile);
		let unsubscribed = $.derived(() => profile()?.unsubscribed);

		$.head('1uxys4i', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Change Email Subscription</title>`);
			});
		});

		$$renderer.push(`<h1 class="text-2xl font-bold mb-6">Email Subscription</h1> `);

		SettingsModule($$renderer, {
			editable: true,
			title: 'Subscription',
			message: unsubscribed()
				? "You are currently unsubscribed from emails"
				: "You are currently subscribed to emails",
			saveButtonTitle: unsubscribed() ? "Re-subscribe" : "Unsubscribe",
			successBody: unsubscribed()
				? "You have been re-subscribed to emails"
				: "You have been unsubscribed from emails",
			formTarget: '/account/api?/toggleEmailSubscription',
			fields: []
		});

		$$renderer.push(`<!---->`);
	});
}