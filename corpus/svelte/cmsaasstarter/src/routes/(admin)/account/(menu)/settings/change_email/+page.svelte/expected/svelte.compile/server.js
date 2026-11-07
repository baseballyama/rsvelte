import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import SettingsModule from "../settings_module.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let adminSection = getContext("adminSection");

		adminSection.set("settings");

		let { data } = $$props;
		let user = $.derived(() => data.user);

		$.head('c58dwk', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Change Email</title>`);
			});
		});

		$$renderer.push(`<h1 class="text-2xl font-bold mb-6">Settings</h1> `);

		SettingsModule($$renderer, {
			title: 'Change Email',
			editable: true,
			successTitle: 'Email change initiated',
			successBody: 'You should receive emails at both the old and new address to confirm the change. Please click the link in both emails to finalized the change. Until finalized, you must sign in with your current email.',
			formTarget: '/account/api?/updateEmail',
			fields: [
				{
					id: "email",
					label: "Email",
					initialValue: user()?.email ?? "",
					placeholder: "Email address"
				}
			]
		});

		$$renderer.push(`<!---->`);
	});
}