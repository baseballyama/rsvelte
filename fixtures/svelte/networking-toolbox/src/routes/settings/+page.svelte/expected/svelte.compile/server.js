import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import SettingsPanel from '$lib/components/furniture/SettingsPanel.svelte';
import Icon from '$lib/components/global/Icon.svelte';
import { accessibility } from '$lib/stores/accessibility';
import { theme } from '$lib/stores/theme';
import { navbarDisplay } from '$lib/stores/navbarDisplay';
import { homepageLayout } from '$lib/stores/homepageLayout';
import { DISABLE_SETTINGS } from '$lib/config/customizable-settings';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onMount(() => {
			// Initialize stores
			accessibility.init();

			theme.init();
			navbarDisplay.init();
			homepageLayout.init();
		});

		$$renderer.push(`<div class="settings-page svelte-1i19ct2"><div class="hero svelte-1i19ct2"><h1 class="svelte-1i19ct2">Settings</h1> <p class="svelte-1i19ct2">Customize your experience with themes, layouts, and accessibility options.</p></div> `);

		if (DISABLE_SETTINGS) {
			$$renderer.push(`<!--[0--><div class="settings-disabled svelte-1i19ct2"><div class="disabled-icon svelte-1i19ct2">`);
			Icon($$renderer, { name: 'lock', size: 'xl' });
			$$renderer.push(`<!----></div> <h2 class="svelte-1i19ct2">Settings Disabled</h2> <p class="svelte-1i19ct2">Settings for this instance have been disabled by your administrator.</p></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
			SettingsPanel($$renderer, { standalone: true });
		}

		$$renderer.push(`<!--]--></div>`);
	});
}