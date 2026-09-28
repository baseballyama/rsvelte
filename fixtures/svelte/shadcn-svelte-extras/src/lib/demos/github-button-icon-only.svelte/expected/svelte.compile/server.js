import * as $ from 'svelte/internal/server';
import { GitHubButton } from '$lib/components/ui/github-button';

export default function Github_button_icon_only($$renderer) {
	GitHubButton($$renderer, { repo: { owner: 'ieedan', repo: 'shadcn-svelte-extras' } });
}