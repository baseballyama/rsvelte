import * as $ from 'svelte/internal/server';
import SettingsModule from "../settings_module.svelte";
import { getContext } from "svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let adminSection = getContext("adminSection");

		adminSection.set("settings");

		let { data } = $$props;
		let profile = $.derived(() => data.profile);

		$.head('zrdtor', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Edit Profile</title>`);
			});
		});

		$$renderer.push(`<h1 class="text-2xl font-bold mb-6">Settings</h1> `);

		SettingsModule($$renderer, {
			editable: true,
			title: 'Edit Profile',
			successTitle: 'Saved Profile',
			formTarget: '/account/api?/updateProfile',
			fields: [
				{
					id: "fullName",
					label: "Name",
					initialValue: profile()?.full_name ?? "",
					placeholder: "Your full name",
					maxlength: 50
				},

				{
					id: "companyName",
					label: "Company Name",
					initialValue: profile()?.company_name ?? "",
					maxlength: 50
				},

				{
					id: "website",
					label: "Company Website",
					initialValue: profile()?.website ?? "",
					maxlength: 50
				}
			]
		});

		$$renderer.push(`<!---->`);
	});
}