import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import SettingsModule from "./settings_module.svelte";

var root = $.from_html(`<h1 class="text-2xl font-bold mb-6">Settings</h1> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let adminSection = getContext("adminSection");

	adminSection.set("settings");

	let profile = $.derived(() => $$props.data.profile);
	let user = $.derived(() => $$props.data.user);
	var fragment = root();

	$.head('1v5ld9s', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Settings';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		let $0 = $.derived(() => [
			{
				id: "fullName",
				label: "Name",
				initialValue: $.get(profile)?.full_name ?? ""
			},

			{
				id: "companyName",
				label: "Company Name",
				initialValue: $.get(profile)?.company_name ?? ""
			},

			{
				id: "website",
				label: "Company Website",
				initialValue: $.get(profile)?.website ?? ""
			}
		]);

		SettingsModule(node, {
			title: 'Profile',
			editable: false,
			get fields() {
				return $.get($0);
			},
			editButtonTitle: 'Edit Profile',
			editLink: '/account/settings/edit_profile'
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => [{ id: "email", initialValue: $.get(user)?.email || "" }]);

		SettingsModule(node_1, {
			title: 'Email',
			editable: false,
			get fields() {
				return $.get($0);
			},
			editButtonTitle: 'Change Email',
			editLink: '/account/settings/change_email'
		});
	}

	var node_2 = $.sibling(node_1, 2);

	SettingsModule(node_2, {
		title: 'Password',
		editable: false,
		fields: [{ id: "password", initialValue: "••••••••••••••••" }],
		editButtonTitle: 'Change Password',
		editLink: '/account/settings/change_password'
	});

	var node_3 = $.sibling(node_2, 2);

	{
		let $0 = $.derived(() => [
			{
				id: "subscriptionStatus",
				initialValue: $.get(profile)?.unsubscribed ? "Unsubscribed" : "Subscribed"
			}
		]);

		SettingsModule(node_3, {
			title: 'Email Subscription',
			editable: false,
			get fields() {
				return $.get($0);
			},
			editButtonTitle: 'Change Subscription',
			editLink: '/account/settings/change_email_subscription'
		});
	}

	var node_4 = $.sibling(node_3, 2);

	SettingsModule(node_4, {
		title: 'Danger Zone',
		editable: false,
		dangerous: true,
		fields: [],
		editButtonTitle: 'Delete Account',
		editLink: '/account/settings/delete_account'
	});

	$.append($$anchor, fragment);
	$.pop();
}