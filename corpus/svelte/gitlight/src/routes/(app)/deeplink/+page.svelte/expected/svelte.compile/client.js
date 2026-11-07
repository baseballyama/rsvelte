import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { AnimatedLogo } from '$lib/components';
import { storage } from '$lib/features';
import { openDesktopApp } from '$lib/helpers';

var root = $.from_html(`<section class="container svelte-1571mmu"><!> <div class="text-container svelte-1571mmu"><h2 class="title svelte-1571mmu">Redirecting you to the GitLight app...</h2> <a class="link svelte-1571mmu" href="/dashboard">Or continue in the browser</a></div></section>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

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

	var section = root();

	$.head('1571mmu', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'GitLight';
		});
	});

	var node = $.child(section);

	AnimatedLogo(node, {});
	$.next(2);
	$.reset(section);
	$.append($$anchor, section);
	$.pop();
}