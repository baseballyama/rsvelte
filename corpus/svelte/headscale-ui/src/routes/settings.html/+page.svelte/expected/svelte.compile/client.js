import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DevSettings from '$lib/settings/DevSettings.svelte';
import ServerSettings from '$lib/settings/ServerSettings.svelte';
import ThemeSettings from '$lib/settings/ThemeSettings.svelte';
import { onMount } from 'svelte';
import { fade } from 'svelte/transition';

var root = $.from_html(`<body><div class="px-4 py-4 w-4/5 max-w-screen-lg"><!> <div class="p-4"></div> <!> <div class="p-4"></div> <h1 class="text-2xl bold text-primary mb-4">Version</h1> <b>insert-version</b> <div class="p-4"></div> <!></div></body>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	//
	// Imports
	//
	// Set to true once component is initialized
	let componentLoaded = false;

	onMount(async () => {
		// Display component frontend
		await new Promise((r) => setTimeout(r, 200));

		componentLoaded = true;
	});

	var body = root();
	var div = $.child(body);
	var node = $.child(div);

	ServerSettings(node, {});

	var node_1 = $.sibling(node, 4);

	ThemeSettings(node_1, {});

	var node_2 = $.sibling(node_1, 10);

	DevSettings(node_2, {});
	$.reset(div);
	$.reset(body);
	$.template_effect(() => $.set_attribute(div, 'hidden', !componentLoaded));
	$.transition(5, div, () => fade);
	$.append($$anchor, body);
	$.pop();
}