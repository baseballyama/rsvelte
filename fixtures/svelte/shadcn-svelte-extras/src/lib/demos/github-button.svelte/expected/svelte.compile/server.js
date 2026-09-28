import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { GitHubButton, getStars } from '$lib/components/ui/github-button';

export default function Github_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let stars = 500;
		const repo = { owner: 'ieedan', repo: 'shadcn-svelte-extras' };

		onMount(async () => {
			stars = await getStars({ ...repo, fallback: 500 });
		});

		GitHubButton($$renderer, { repo, stars });
	});
}