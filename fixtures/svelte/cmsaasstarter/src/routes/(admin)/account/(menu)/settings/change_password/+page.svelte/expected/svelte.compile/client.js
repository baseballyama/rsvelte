import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/stores";
import { getContext } from "svelte";
import SettingsModule from "../settings_module.svelte";

var root = $.from_html(
	`<div class="font-bold">Set Password By Email</div> <div>You use oAuth to sign in ("Sign in with Github" or similar). You can
          continue to access your account using only oAuth if you like!</div>`,
	1
);

var root_1 = $.from_html(`<div class="font-bold">Change Password By Email</div>`);

var root_2 = $.from_html(`<div class="card p-6 pb-7 mt-8 max-w-xl flex flex-col md:flex-row shadow-sm max-w-md"><div class="flex flex-col gap-y-4"><!> <div> </div> <button> </button> <div>Sent email! Please check your inbox and use the link to set your
        password.</div></div></div>`);

var root_3 = $.from_html(`<h1 class="text-2xl font-bold mb-6">Change Password</h1> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let adminSection = getContext("adminSection");

	adminSection.set("settings");

	let user = $.derived(() => $$props.data.user);
	let supabase = $.derived(() => $$props.data.supabase);

	// True if definitely has a password, but can be false if they
	// logged in with oAuth or email link
	// Supabase does not maintain an AMR typedef so we cast through any
	let amr = $.derived(() => $.get(user)?.amr);

	let hasPassword = $.derived(() => $.get(amr)?.find((x) => x.method === "password") ? true : false);
	let usingOAuth = $.derived(() => $.get(amr)?.find((x) => x.method === "oauth") ? true : false);
	let sendBtnDisabled = $.state(false);
	let sendBtnText = $.state("Send Set Password Email");
	let sentEmail = $.state(false);

	let sendForgotPassword = () => {
		$.set(sendBtnDisabled, true);
		$.set(sendBtnText, "Sending...");

		let email = $.get(user)?.email;

		if (email) {
			$.get(supabase).auth.resetPasswordForEmail(email, {
				redirectTo: `${$page().url.origin}/auth/callback?next=%2Faccount%2Fsettings%2Freset_password`
			}).then((d) => {
				$.set(sentEmail, d.error ? false : true, true);
				$.set(sendBtnDisabled, false);
				$.set(sendBtnText, "Send Forgot Password Email");
			});
		}
	};

	var fragment = root_3();

	$.head('b0aed7', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Change Password';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		var consequent = ($$anchor) => {
			SettingsModule($$anchor, {
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
		};

		var alternate_1 = ($$anchor) => {
			var div = root_2();
			var div_1 = $.child(div);
			var node_1 = $.child(div_1);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_2 = root();

					$.next(2);
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var div_2 = root_1();

					$.append($$anchor, div_2);
				};

				$.if(node_1, ($$render) => {
					if ($.get(usingOAuth)) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			var div_3 = $.sibling(node_1, 2);
			var text = $.only_child(div_3);
			var button = $.sibling(div_3, 2);
			var text_1 = $.only_child(button, true);
			var div_4 = $.sibling(button, 2);

			$.reset(div_1);
			$.reset(div);

			$.template_effect(() => {
				$.set_text(text, `The button below will send you an email at ${$.get(user)?.email ?? ''} which will allow
        you to set your password.`);

				$.set_class(button, 1, `btn btn-outline btn-wide ${$.get(sentEmail) ? 'hidden' : ''}`);
				button.disabled = $.get(sendBtnDisabled);
				$.set_text(text_1, $.get(sendBtnText));
				$.set_class(div_4, 1, `success alert alert-success ${$.get(sentEmail) ? '' : 'hidden'}`);
			});

			$.delegated('click', button, sendForgotPassword);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(hasPassword)) $$render(consequent); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);