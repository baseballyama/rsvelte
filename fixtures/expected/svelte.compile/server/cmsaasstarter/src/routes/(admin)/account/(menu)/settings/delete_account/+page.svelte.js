import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import SettingsModule from "../settings_module.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let adminSection = getContext("adminSection");

		adminSection.set("settings");

		let { data } = $$props;
		let session = $.derived(() => data.session);

		$.head('1yv08kg', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Delete Account</title>`);
			});
		});

		$$renderer.push(`<h1 class="text-2xl font-bold mb-6">Settings</h1> `);

		SettingsModule($$renderer, {
			title: 'Delete Account',
			editable: true,
			dangerous: true,
			message: `Deleting your account can not be undone. You are currently logged in as '${$.stringify(session()?.user?.email)}'`,
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

		$$renderer.push(`<!---->`);
	});
}