// Theme state shared across the site. The actual `data-theme` attribute on
// <html> is set by the inline bootstrap in app.html before first paint —
// this module just exposes a reactive view of it and persists user choices.

import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

function readInitial(): Theme {
	if (!browser) return 'light';
	const t = document.documentElement.getAttribute('data-theme');
	return t === 'dark' ? 'dark' : 'light';
}

let theme = $state<Theme>(readInitial());

export const themeStore = {
	get current(): Theme {
		return theme;
	},
	toggle(): void {
		this.set(theme === 'dark' ? 'light' : 'dark');
	},
	set(next: Theme): void {
		theme = next;
		if (!browser) return;
		document.documentElement.setAttribute('data-theme', next);
		try {
			localStorage.setItem('rsvelte:theme', next);
		} catch {
			// localStorage can throw under private-browsing quotas — falling
			// back to in-memory state is fine, the OS preference will still
			// reapply on next load.
		}
	}
};
