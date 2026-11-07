import * as $ from 'svelte/internal/server';

export default function ThemeToggle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let theme = 'dark';

		// Read the value set by the anti-FOWT inline script
		// Follow OS preference changes when the user hasn't manually chosen
		function toggle() {
			theme = theme === 'dark' ? 'light' : 'dark';
			document.documentElement.dataset.theme = theme;
			localStorage.setItem('sp-blog-theme', theme);
		}

		$$renderer.push(`<button class="sp-theme-toggle svelte-1m0y0gq"${$.attr('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode')}${$.attr('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode')}>`);

		if (theme === 'dark') {
			$$renderer.push(`<!--[0--><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`);
		} else {
			$$renderer.push(`<!--[-1--><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`);
		}

		$$renderer.push(`<!--]--></button>`);
	});
}