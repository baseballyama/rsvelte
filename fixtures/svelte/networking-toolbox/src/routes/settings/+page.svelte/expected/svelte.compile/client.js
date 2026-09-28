import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import SettingsPanel from '$lib/components/furniture/SettingsPanel.svelte';
import Icon from '$lib/components/global/Icon.svelte';
import { accessibility } from '$lib/stores/accessibility';
import { theme } from '$lib/stores/theme';
import { navbarDisplay } from '$lib/stores/navbarDisplay';
import { homepageLayout } from '$lib/stores/homepageLayout';
import { DISABLE_SETTINGS } from '$lib/config/customizable-settings';

var root = $.from_html(`<div class="settings-disabled svelte-1i19ct2"><div class="disabled-icon svelte-1i19ct2"><!></div> <h2 class="svelte-1i19ct2">Settings Disabled</h2> <p class="svelte-1i19ct2">Settings for this instance have been disabled by your administrator.</p></div>`);
var root_1 = $.from_html(`<div class="settings-page svelte-1i19ct2"><div class="hero svelte-1i19ct2"><h1 class="svelte-1i19ct2">Settings</h1> <p class="svelte-1i19ct2">Customize your experience with themes, layouts, and accessibility options.</p></div> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	onMount(() => {
		// Initialize stores
		accessibility.init();

		theme.init();
		navbarDisplay.init();
		homepageLayout.init();
	});

	var div = root_1();
	var node = $.sibling($.child(div), 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var div_2 = $.child(div_1);
			var node_1 = $.child(div_2);

			Icon(node_1, { name: 'lock', size: 'xl' });
			$.reset(div_2);
			$.next(4);
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var alternate = ($$anchor) => {
			SettingsPanel($$anchor, { standalone: true });
		};

		$.if(node, ($$render) => {
			if (DISABLE_SETTINGS) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}