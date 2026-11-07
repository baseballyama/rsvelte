import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip';
import { browser } from '$app/environment';
import { accessibility } from '$lib/stores/accessibility';
import { theme } from '$lib/stores/theme';
import { navbarDisplay } from '$lib/stores/navbarDisplay';
import { homepageLayout } from '$lib/stores/homepageLayout';
import SettingsPanel from '$lib/components/furniture/SettingsPanel.svelte';

export default function SettingsMenu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let isOpen = false;
		let menuRef = void 0;
		let triggerRef = void 0;

		// Shortcut key detection
		const isMac = browser && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

		const shortcutKey = isMac ? '⌘' : 'Ctrl';

		// Handle clicks outside menu
		function handleClickOutside(event) {
			if (isOpen && menuRef && !menuRef.contains(event.target) && !triggerRef?.contains(event.target)) {
				isOpen = false;
			}
		}

		// Handle escape key
		function handleKeydown(event) {
			if (event.key === 'Escape' && isOpen) {
				isOpen = false;
				triggerRef?.focus();
			}
		}

		// Handle global keyboard shortcuts
		function handleGlobalKeydown(event) {
			if ((event.metaKey || event.ctrlKey) && event.key === ',') {
				event.preventDefault();
				isOpen = !isOpen;
			}
		}

		// Handle close from panel
		function handleClose() {
			isOpen = false;
		}

		// Handle double-click to navigate to settings page
		function handleDoubleClick() {
			goto('/settings');
		}

		onMount(() => {
			document.addEventListener('click', handleClickOutside);
			document.addEventListener('keydown', handleKeydown);
			document.addEventListener('keydown', handleGlobalKeydown);

			// Initialize stores
			accessibility.init();

			theme.init();
			navbarDisplay.init();
			homepageLayout.init();

			return () => {
				document.removeEventListener('click', handleClickOutside);
				document.removeEventListener('keydown', handleKeydown);
				document.removeEventListener('keydown', handleGlobalKeydown);
			};
		});

		$$renderer.push(`<div class="settings-menu svelte-cfx6oj"><button class="action-button settings-trigger svelte-cfx6oj" aria-label="Open Settings"${$.attr('aria-expanded', isOpen)} aria-haspopup="menu">`);
		Icon($$renderer, { name: 'settings2', size: 'sm' });
		$$renderer.push(`<!----></button> `);

		if (isOpen) {
			$$renderer.push('<!--[0-->');
			SettingsPanel($$renderer, { onClose: handleClose });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}