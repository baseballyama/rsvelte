import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import SettingsModule from "../settings_module.svelte";

var root = $.from_html(`<h1 class="text-2xl font-bold mb-6">Settings</h1> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let adminSection = getContext("adminSection");

	adminSection.set("settings");

	let session = $.derived(() => $$props.data.session);
	var fragment = root();

	$.head('1yv08kg', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Delete Account';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		let $0 = $.derived(() => $.get(session)?.user?.email);

		SettingsModule(node, {
			title: 'Delete Account',
			editable: true,
			dangerous: true,
			get message() {
				return `Deleting your account can not be undone. You are currently logged in as '${$.get($0) ?? ''}'`;
			},
			saveButtonTitle: 'Delete Account',
			successTitle: 'Account queued for deletion',
			successBody: 'Your account will be deleted shortly.',
			formTarget: '/account/api?/deleteAccount',
			fields: [
				{
					id: "currentPassword",
					label: "Current Password",
					initialValue: "",
					inputType: "password"
				}
			]
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}