import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SettingsModule from "../settings_module.svelte";

var root = $.from_html(`<h1 class="text-2xl font-bold mb-6">Email Subscription</h1> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let profile = $.derived(() => $$props.data.profile);
	let unsubscribed = $.derived(() => $.get(profile)?.unsubscribed);
	var fragment = root();

	$.head('1uxys4i', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Change Email Subscription';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		let $0 = $.derived(() => $.get(unsubscribed)
			? "You are currently unsubscribed from emails"
			: "You are currently subscribed to emails");

		let $1 = $.derived(() => $.get(unsubscribed) ? "Re-subscribe" : "Unsubscribe");

		let $2 = $.derived(() => $.get(unsubscribed)
			? "You have been re-subscribed to emails"
			: "You have been unsubscribed from emails");

		SettingsModule(node, {
			editable: true,
			title: 'Subscription',
			get message() {
				return $.get($0);
			},

			get saveButtonTitle() {
				return $.get($1);
			},

			get successBody() {
				return $.get($2);
			},
			formTarget: '/account/api?/toggleEmailSubscription',
			fields: []
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}