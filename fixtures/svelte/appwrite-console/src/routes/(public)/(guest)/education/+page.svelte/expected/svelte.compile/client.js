import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { app } from '$lib/stores/app';
import { sdk } from '$lib/stores/sdk';
import { OAuthProvider } from '@appwrite.io/console';
import { Button } from '$lib/elements/forms';
import AppwriteLogoDark from '$lib/images/appwrite-logo-dark.svg';
import AppwriteLogoLight from '$lib/images/appwrite-logo-light.svg';
import GithubLogoDark from '$lib/images/github-logo-dark.svg';
import GithubLogoLight from '$lib/images/github-logo-light.svg';
import { base } from '$app/paths';

var root = $.from_html(`<span class="icon-github" aria-hidden="true"></span> <span class="text">Sign up with GitHub</span>`, 1);

var root_1 = $.from_html(`<div class="content svelte-1lezngi"><div class="logos svelte-1lezngi"><img alt="Appwrite logo"/> <div class="logo-divider svelte-1lezngi"></div> <img alt="Github logo"/></div> <h1 class="svelte-1lezngi">Join the Appwrite Education Program</h1> <p class="svelte-1lezngi">Enjoy Appwrite Cloud for free throughout your student journey as part of the GitHub Student
        Developer Pack.</p> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $app = () => $.store_get(app, '$app', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	function onGithubLogin() {
		localStorage.setItem('githubEducationProgram', 'true');

		sdk.forConsole.account.createOAuth2Session({
			provider: OAuthProvider.Github,
			success: window.location.origin + base + '/education?success',
			failure: window.location.origin + base + '/education?failure',
			scopes: ['read:user', 'user:email']
		});
	}

	var div = root_1();

	$.head('1lezngi', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Sign up - Appwrite Education Program';
		});
	});

	var div_1 = $.child(div);
	var img = $.child(div_1);
	var img_1 = $.sibling(img, 4);

	$.reset(div_1);

	var node = $.sibling(div_1, 6);

	Button(node, {
		fullWidth: true,
		$$events: { click: onGithubLogin },
		children: ($$anchor, $$slotProps) => {
			var fragment = root();

			$.next(2);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(img, 'src', $app().themeInUse === 'light' ? AppwriteLogoLight : AppwriteLogoDark);
		$.set_attribute(img_1, 'src', $app().themeInUse === 'light' ? GithubLogoLight : GithubLogoDark);
	});

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}