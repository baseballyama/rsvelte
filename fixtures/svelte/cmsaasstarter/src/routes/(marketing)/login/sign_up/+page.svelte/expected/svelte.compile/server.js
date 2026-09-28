import * as $ from 'svelte/internal/server';
import { Auth } from "@supabase/auth-ui-svelte";
import { sharedAppearance, oauthProviders } from "../login_config";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		$.head('hlagbe', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Sign up</title>`);
			});
		});

		$$renderer.push(`<h1 class="text-2xl font-bold mb-6">Sign Up</h1> `);

		Auth($$renderer, {
			supabaseClient: data.supabase,
			view: 'sign_up',
			redirectTo: `${data.url}/auth/callback`,
			showLinks: false,
			providers: oauthProviders,
			socialLayout: 'horizontal',
			appearance: sharedAppearance,
			additionalData: undefined
		});

		$$renderer.push(`<!----> <div class="text-l text-slate-800 mt-4 mb-2">Have an account? <a class="underline" href="/login/sign_in">Sign in</a>.</div>`);
	});
}