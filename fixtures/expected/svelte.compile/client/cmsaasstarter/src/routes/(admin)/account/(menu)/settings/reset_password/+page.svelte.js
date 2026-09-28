import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import SettingsModule from "../settings_module.svelte";

var root = $.from_html(`<h1 class="text-2xl font-bold mb-6">Settings</h1> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let adminSection = getContext("adminSection");

	adminSection.set("settings");

	var fragment = root();

	$.head('12mkm6q', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Reset Password';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	SettingsModule(node, {
		title: 'Reset Password',
		editable: true,
		saveButtonTitle: 'Reset Password',
		successTitle: 'Password Changed',
		successBody: 'On next sign in, use your new password.',
		formTarget: '/account/api?/updatePassword',
		fields: [
			{
				id: "newPassword1",
				label: "New Password",
				initialValue: "",
				inputType: "password"
			},

			{
				id: "newPassword2",
				label: "Confirm New Password",
				initialValue: "",
				inputType: "password"
			}
		]
	});

	$.append($$anchor, fragment);
	$.pop();
}