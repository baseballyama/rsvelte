import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Auth } from "@supabase/auth-ui-svelte";
import { sharedAppearance, oauthProviders } from "../login_config";
import { goto } from "$app/navigation";
import { onMount } from "svelte";
import { page } from "$app/stores";

var root = $.from_html(`<div role="alert" class="alert alert-success mb-5"><svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span>Email verified! Please sign in.</span></div>`);
var root_1 = $.from_html(`<!> <h1 class="text-2xl font-bold mb-6">Sign In</h1> <!> <div class="text-l text-slate-800 mt-4"><a class="underline" href="/login/forgot_password">Forgot password?</a></div> <div class="text-l text-slate-800 mt-3">Don't have an account? <a class="underline" href="/login/sign_up">Sign up</a>.</div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let supabase = $.derived(() => $$props.data.supabase);

	onMount(() => {
		const { data } = $.get(supabase).auth.onAuthStateChange((event) => {
			// Redirect to account after successful login
			if (event == "SIGNED_IN") {
				// Delay needed because order of callback not guaranteed.
				// Give the layout callback priority to update state or
				// we'll just bounch back to login when /account tries to load
				setTimeout(
					() => {
						goto("/account");
					},
					1
				);
			}
		});

		return () => data.subscription.unsubscribe();
	});

	var fragment = root_1();

	$.head('434x9k', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Sign in';
		});
	});

	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.append($$anchor, div);
		};

		var d = $.derived(() => $page().url.searchParams.get("verified") == "true");

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 4);

	{
		let $0 = $.derived(() => `${$$props.data.url}/auth/callback`);

		Auth(node_1, {
			get supabaseClient() {
				return $$props.data.supabase;
			},
			view: 'sign_in',
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

	$.next(4);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}