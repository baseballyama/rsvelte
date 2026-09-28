import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Auth } from "@supabase/auth-ui-svelte";
import { sharedAppearance, oauthProviders } from "../login_config";

var root = $.from_html(`<h1 class="text-2xl font-bold mb-6">Sign Up</h1> <!> <div class="text-l text-slate-800 mt-4 mb-2">Have an account? <a class="underline" href="/login/sign_in">Sign in</a>.</div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();

	$.head('hlagbe', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Sign up';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		let $0 = $.derived(() => `${$$props.data.url}/auth/callback`);

		Auth(node, {
			get supabaseClient() {
				return $$props.data.supabase;
			},
			view: 'sign_up',
			get redirectTo() {
				return $.get($0);
			},
			showLinks: false,
			get providers() {
				return oauthProviders;
			},
			socialLayout: 'horizontal',
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