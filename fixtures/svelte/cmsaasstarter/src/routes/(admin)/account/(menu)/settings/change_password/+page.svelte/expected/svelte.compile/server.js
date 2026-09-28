import * as $ from 'svelte/internal/server';
import { page } from "$app/stores";
import { getContext } from "svelte";
import SettingsModule from "../settings_module.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let adminSection = getContext("adminSection");

		adminSection.set("settings");

		let { data } = $$props;
		let user = $.derived(() => data.user);
		let supabase = $.derived(() => data.supabase);

		// True if definitely has a password, but can be false if they
		// logged in with oAuth or email link
		// Supabase does not maintain an AMR typedef so we cast through any
		let amr = $.derived(() => user()?.amr);

		let hasPassword = $.derived(() => amr()?.find((x) => x.method === "password") ? true : false);
		let usingOAuth = $.derived(() => amr()?.find((x) => x.method === "oauth") ? true : false);
		let sendBtnDisabled = false;
		let sendBtnText = "Send Set Password Email";
		let sentEmail = false;

		let sendForgotPassword = () => {
			sendBtnDisabled = true;
			sendBtnText = "Sending...";

			let email = user()?.email;

			if (email) {
				supabase().auth.resetPasswordForEmail(email, {
					redirectTo: `${$.store_get($$store_subs ??= {}, '$page', page).url.origin}/auth/callback?next=%2Faccount%2Fsettings%2Freset_password`
				}).then((d) => {
					sentEmail = d.error ? false : true;
					sendBtnDisabled = false;
					sendBtnText = "Send Forgot Password Email";
				});
			}
		};

		$.head('b0aed7', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Change Password</title>`);
			});
		});

		$$renderer.push(`<h1 class="text-2xl font-bold mb-6">Change Password</h1> `);

		if (hasPassword()) {
			$$renderer.push('<!--[0-->');

			SettingsModule($$renderer, {
				title: 'Change Password',
				editable: true,
				saveButtonTitle: 'Change Password',
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
					},

					{
						id: "currentPassword",
						label: "Current Password",
						initialValue: "",
						inputType: "password"
					}
				]
			});
		} else {
			$$renderer.push(`<!--[-1--><div class="card p-6 pb-7 mt-8 max-w-xl flex flex-col md:flex-row shadow-sm max-w-md"><div class="flex flex-col gap-y-4">`);

			if (usingOAuth()) {
				$$renderer.push(`<!--[0--><div class="font-bold">Set Password By Email</div> <div>You use oAuth to sign in ("Sign in with Github" or similar). You can
          continue to access your account using only oAuth if you like!</div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="font-bold">Change Password By Email</div>`);
			}

			$$renderer.push(`<!--]--> <div>The button below will send you an email at ${$.escape(user()?.email)} which will allow
        you to set your password.</div> <button${$.attr_class(`btn btn-outline btn-wide ${sentEmail ? 'hidden' : ''}`)}${$.attr('disabled', sendBtnDisabled, true)}>${$.escape(sendBtnText)}</button> <div${$.attr_class(`success alert alert-success ${sentEmail ? '' : 'hidden'}`)}>Sent email! Please check your inbox and use the link to set your
        password.</div></div></div>`);
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}