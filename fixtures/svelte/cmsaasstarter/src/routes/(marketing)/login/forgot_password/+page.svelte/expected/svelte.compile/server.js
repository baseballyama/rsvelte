import * as $ from 'svelte/internal/server';
import { Auth } from "@supabase/auth-ui-svelte";
import { sharedAppearance, oauthProviders } from "../login_config";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		$.head('1q99pjc', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Forgot Password</title>`);
			});
		});

		$$renderer.push(`<h1 class="text-2xl font-bold mb-6">Forgot Password</h1> `);

		Auth($$renderer, {
			supabaseClient: data.supabase,
			view: 'forgotten_password',
			redirectTo: `${data.url}/auth/callback?next=%2Faccount%2Fsettings%2Freset_password`,
			providers: oauthProviders,
			socialLayout: 'horizontal',
			showLinks: false,
			appearance: sharedAppearance,
			additionalData: undefined
		});

		$$renderer.push(`<!----> <div class="text-l text-slate-800 mt-4">Remember your password? <a class="underline" href="/login/sign_in">Sign in</a>.</div>`);
	});
}