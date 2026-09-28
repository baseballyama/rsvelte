import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { GitHubButton, getStars } from '$lib/components/ui/github-button';

export default function Github_button($$anchor, $$props) {
	$.push($$props, true);

	let stars = $.state(500);
	const repo = { owner: 'ieedan', repo: 'shadcn-svelte-extras' };

	onMount(async () => {
		$.set(stars, await getStars({ ...repo, fallback: 500 }), true);
	});

	GitHubButton($$anchor, {
		get repo() {
			return repo;
		},

		get stars() {
			return $.get(stars);
		}
	});

	$.pop();
}