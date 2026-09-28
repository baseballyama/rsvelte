import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SettingsModule from "../settings_module.svelte";
import { getContext } from "svelte";

var root = $.from_html(`<h1 class="text-2xl font-bold mb-6">Settings</h1> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let adminSection = getContext("adminSection");

	adminSection.set("settings");

	let profile = $.derived(() => $$props.data.profile);
	var fragment = root();

	$.head('zrdtor', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Edit Profile';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		let $0 = $.derived(() => [
			{
				id: "fullName",
				label: "Name",
				initialValue: $.get(profile)?.full_name ?? "",
				placeholder: "Your full name",
				maxlength: 50
			},

			{
				id: "companyName",
				label: "Company Name",
				initialValue: $.get(profile)?.company_name ?? "",
				maxlength: 50
			},

			{
				id: "website",
				label: "Company Website",
				initialValue: $.get(profile)?.website ?? "",
				maxlength: 50
			}
		]);

		SettingsModule(node, {
			editable: true,
			title: 'Edit Profile',
			successTitle: 'Saved Profile',
			formTarget: '/account/api?/updateProfile',
			get fields() {
				return $.get($0);
			}
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}