import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { AnimatedLogo } from '$lib/components';
import { storage } from '$lib/features';
import { openDesktopApp } from '$lib/helpers';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onMount(() => {
			const githubAccessToken = storage.get('github-access-token');
			const gitlabAccessToken = storage.get('gitlab-access-token');
			const gitlabRefreshToken = storage.get('gitlab-refresh-token');
			const gitlabExpiresIn = storage.get('gitlab-expires-in');
			const gitlabUrl = storage.get('gitlab-url');
			const gitlabPat = storage.get('gitlab-pat');

			if (githubAccessToken || gitlabAccessToken && gitlabRefreshToken && gitlabExpiresIn || gitlabUrl && gitlabPat) {
				openDesktopApp({
					githubAccessToken,
					gitlabAccessToken,
					gitlabRefreshToken,
					gitlabExpiresIn,
					gitlabUrl,
					gitlabPat
				});
			}
		});

		$.head('1571mmu', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>GitLight</title>`);
			});
		});

		$$renderer.push(`<section class="container svelte-1571mmu">`);
		AnimatedLogo($$renderer, {});
		$$renderer.push(`<!----> <div class="text-container svelte-1571mmu"><h2 class="title svelte-1571mmu">Redirecting you to the GitLight app...</h2> <a class="link svelte-1571mmu" href="/dashboard">Or continue in the browser</a></div></section>`);
	});
}