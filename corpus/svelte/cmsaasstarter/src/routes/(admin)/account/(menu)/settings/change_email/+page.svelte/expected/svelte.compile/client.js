import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import SettingsModule from "../settings_module.svelte";

var root = $.from_html(`<h1 class="text-2xl font-bold mb-6">Settings</h1> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let adminSection = getContext("adminSection");

	adminSection.set("settings");

	let user = $.derived(() => $$props.data.user);
	var fragment = root();

	$.head('c58dwk', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Change Email';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		let $0 = $.derived(() => [
			{
				id: "email",
				label: "Email",
				initialValue: $.get(user)?.email ?? "",
				placeholder: "Email address"
			}
		]);

		SettingsModule(node, {
			title: 'Change Email',
			editable: true,
			successTitle: 'Email change initiated',
			successBody: 'You should receive emails at both the old and new address to confirm the change. Please click the link in both emails to finalized the change. Until finalized, you must sign in with your current email.',
			formTarget: '/account/api?/updateEmail',
			get fields() {
				return $.get($0);
			}
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}