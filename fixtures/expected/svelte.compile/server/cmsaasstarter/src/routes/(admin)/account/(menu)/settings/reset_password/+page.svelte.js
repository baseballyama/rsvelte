import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import SettingsModule from "../settings_module.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let adminSection = getContext("adminSection");

		adminSection.set("settings");

		$.head('12mkm6q', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Reset Password</title>`);
			});
		});

		$$renderer.push(`<h1 class="text-2xl font-bold mb-6">Settings</h1> `);

		SettingsModule($$renderer, {
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

		$$renderer.push(`<!---->`);
	});
}