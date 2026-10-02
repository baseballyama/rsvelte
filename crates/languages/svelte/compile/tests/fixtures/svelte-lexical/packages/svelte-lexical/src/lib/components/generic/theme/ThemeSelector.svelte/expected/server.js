import * as $ from 'svelte/internal/server';
import { CAN_USE_DOM } from '@lexical/utils';
import { onMount, onDestroy } from 'svelte';
import { themeTracker } from './themeTracker.svelte.js';

function systemIcon($$renderer) {
	$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-monitor-icon lucide-monitor svelte-1ie1u2t"><rect width="20" height="14" x="2" y="3" rx="2"></rect><line x1="8" x2="16" y1="21" y2="21"></line><line x1="12" x2="12" y1="17" y2="21"></line></svg>`);
}

function lightIcon($$renderer) {
	$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svelte-1ie1u2t"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`);
}

function darkIcon($$renderer) {
	$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svelte-1ie1u2t"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`);
}

export default function ThemeSelector($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let showDropdown = false;

		function toggleDropdown() {
			showDropdown = !showDropdown;
		}

		// Close dropdown when clicking outside
		function handleClickOutside(event) {
			const selector = document.querySelector('.theme-selector');

			if (showDropdown && selector && !event.composedPath().includes(selector)) {
				showDropdown = false;
			}
		}

		// Add and remove event listener
		onMount(() => {
			if (CAN_USE_DOM === false) return;

			document.addEventListener('click', handleClickOutside);
		});

		onDestroy(() => {
			if (CAN_USE_DOM === false) return;

			document.removeEventListener('click', handleClickOutside);
		});

		function changeMode(mode) {
			themeTracker.mode = mode;
			showDropdown = false;
		}

		$.head('1ie1u2t', $$renderer, ($$renderer) => {
			$$renderer.push(`<script>
    const themeMode = localStorage.getItem('app-theme');
    let themeColor;
    if (!themeMode || themeMode === 'system') {
      themeColor = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } else {
      themeColor = themeMode;
    }

    document.querySelector('html')?.setAttribute('data-theme', themeColor);
  </script>`);

			$$renderer.push(`<!---->`);
		});

		$$renderer.push(`<div class="theme-selector svelte-1ie1u2t"><button type="button" aria-label="Toggle theme menu" title="Change theme" class="theme-button svelte-1ie1u2t">`);

		if (themeTracker.mode === 'system') {
			$$renderer.push('<!--[0-->');
			systemIcon($$renderer);
		} else if (themeTracker.mode === 'light') {
			$$renderer.push('<!--[1-->');
			lightIcon($$renderer);
		} else {
			$$renderer.push('<!--[-1-->');
			darkIcon($$renderer);
		}

		$$renderer.push(`<!--]--></button> `);

		if (showDropdown) {
			$$renderer.push(`<!--[0--><div class="theme-dropdown svelte-1ie1u2t"><button${$.attr_class(`theme-option ${themeTracker.mode === 'system' ? 'active' : ''}`, 'svelte-1ie1u2t')}>`);
			systemIcon($$renderer);
			$$renderer.push(`<!----> <span>System</span></button> <button${$.attr_class(`theme-option ${themeTracker.mode === 'light' ? 'active' : ''}`, 'svelte-1ie1u2t')}>`);
			lightIcon($$renderer);
			$$renderer.push(`<!----> <span>Light</span></button> <button${$.attr_class(`theme-option ${themeTracker.mode === 'dark' ? 'active' : ''}`, 'svelte-1ie1u2t')}>`);
			darkIcon($$renderer);
			$$renderer.push(`<!----> <span>Dark</span></button></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}