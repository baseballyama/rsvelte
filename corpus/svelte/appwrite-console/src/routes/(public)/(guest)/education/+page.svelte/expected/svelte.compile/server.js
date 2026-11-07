import * as $ from 'svelte/internal/server';
import { app } from '$lib/stores/app';
import { sdk } from '$lib/stores/sdk';
import { OAuthProvider } from '@appwrite.io/console';
import { Button } from '$lib/elements/forms';
import AppwriteLogoDark from '$lib/images/appwrite-logo-dark.svg';
import AppwriteLogoLight from '$lib/images/appwrite-logo-light.svg';
import GithubLogoDark from '$lib/images/github-logo-dark.svg';
import GithubLogoLight from '$lib/images/github-logo-light.svg';
import { base } from '$app/paths';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		function onGithubLogin() {
			localStorage.setItem('githubEducationProgram', 'true');

			sdk.forConsole.account.createOAuth2Session({
				provider: OAuthProvider.Github,
				success: window.location.origin + base + '/education?success',
				failure: window.location.origin + base + '/education?failure',
				scopes: ['read:user', 'user:email']
			});
		}

		$.head('1lezngi', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Sign up - Appwrite Education Program</title>`);
			});
		});

		$$renderer.push(`<div class="content svelte-1lezngi"><div class="logos svelte-1lezngi"><img${$.attr('src', $.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'light' ? AppwriteLogoLight : AppwriteLogoDark)} alt="Appwrite logo"/> <div class="logo-divider svelte-1lezngi"></div> <img${$.attr('src', $.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'light' ? GithubLogoLight : GithubLogoDark)} alt="Github logo"/></div> <h1 class="svelte-1lezngi">Join the Appwrite Education Program</h1> <p class="svelte-1lezngi">Enjoy Appwrite Cloud for free throughout your student journey as part of the GitHub Student
        Developer Pack.</p> `);

		Button($$renderer, {
			fullWidth: true,
			children: ($$renderer) => {
				$$renderer.push(`<span class="icon-github" aria-hidden="true"></span> <span class="text">Sign up with GitHub</span>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}