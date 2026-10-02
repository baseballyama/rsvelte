import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import SettingsModule from "./settings_module.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let adminSection = getContext("adminSection");

		adminSection.set("settings");

		let { data } = $$props;
		let profile = $.derived(() => data.profile);
		let user = $.derived(() => data.user);

		$.head('1v5ld9s', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Settings</title>`);
			});
		});

		$$renderer.push(`<h1 class="text-2xl font-bold mb-6">Settings</h1> `);

		SettingsModule($$renderer, {
			title: 'Profile',
			editable: false,
			fields: [
				{
					id: "fullName",
					label: "Name",
					initialValue: profile()?.full_name ?? ""
				},

				{
					id: "companyName",
					label: "Company Name",
					initialValue: profile()?.company_name ?? ""
				},

				{
					id: "website",
					label: "Company Website",
					initialValue: profile()?.website ?? ""
				}
			],
			editButtonTitle: 'Edit Profile',
			editLink: '/account/settings/edit_profile'
		});

		$$renderer.push(`<!----> `);

		SettingsModule($$renderer, {
			title: 'Email',
			editable: false,
			fields: [{ id: "email", initialValue: user()?.email || "" }],
			editButtonTitle: 'Change Email',
			editLink: '/account/settings/change_email'
		});

		$$renderer.push(`<!----> `);

		SettingsModule($$renderer, {
			title: 'Password',
			editable: false,
			fields: [{ id: "password", initialValue: "••••••••••••••••" }],
			editButtonTitle: 'Change Password',
			editLink: '/account/settings/change_password'
		});

		$$renderer.push(`<!----> `);

		SettingsModule($$renderer, {
			title: 'Email Subscription',
			editable: false,
			fields: [
				{
					id: "subscriptionStatus",
					initialValue: profile()?.unsubscribed ? "Unsubscribed" : "Subscribed"
				}
			],
			editButtonTitle: 'Change Subscription',
			editLink: '/account/settings/change_email_subscription'
		});

		$$renderer.push(`<!----> `);

		SettingsModule($$renderer, {
			title: 'Danger Zone',
			editable: false,
			dangerous: true,
			fields: [],
			editButtonTitle: 'Delete Account',
			editLink: '/account/settings/delete_account'
		});

		$$renderer.push(`<!---->`);
	});
}