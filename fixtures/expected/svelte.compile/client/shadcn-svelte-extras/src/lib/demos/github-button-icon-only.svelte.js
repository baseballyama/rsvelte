import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { GitHubButton } from '$lib/components/ui/github-button';

export default function Github_button_icon_only($$anchor) {
	GitHubButton($$anchor, { repo: { owner: 'ieedan', repo: 'shadcn-svelte-extras' } });
}