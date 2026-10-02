import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Auth } from "@supabase/auth-ui-svelte";
import { sharedAppearance, oauthProviders } from "../login_config";

var root = $.from_html(`<h1 class="text-2xl font-bold mb-6">Forgot Password</h1> <!> <div class="text-l text-slate-800 mt-4">Remember your password? <a class="underline" href="/login/sign_in">Sign in</a>.</div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();

	$.head('1q99pjc', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Forgot Password';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		let $0 = $.derived(() => `${$$props.data.url}/auth/callback?next=%2Faccount%2Fsettings%2Freset_password`);

		Auth(node, {
			get supabaseClient() {
				return $$props.data.supabase;
			},
			view: 'forgotten_password',
			get redirectTo() {
				return $.get($0);
			},

			get providers() {
				return oauthProviders;
			},
			socialLayout: 'horizontal',
			showLinks: false,
			get appearance() {
				return sharedAppearance;
			},
			additionalData: undefined
		});
	}

	$.next(2);
	$.append($$anchor, fragment);
	$.pop();
}