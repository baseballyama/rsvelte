import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { showACLPagesStore } from '$lib/common/stores';
import { onMount } from 'svelte';
import { fade } from 'svelte/transition';

var root = $.from_html(`<div class="px-4 py-4 w-4/5 max-w-screen-lg"><h1 class="text-2xl bold text-primary">Group View</h1></div>`);
var root_1 = $.from_html(`<body><!></body>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	//
	// Imports
	//
	// Set to true once component is initialized
	let componentLoaded = false;

	onMount(async () => {
		componentLoaded = true;
	});

	var body = root_1();
	var node = $.child(body);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.template_effect(() => $.set_attribute(div, 'hidden', !componentLoaded));
			$.transition(5, div, () => fade);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (showACLPagesStore) $$render(consequent);
		});
	}

	$.reset(body);
	$.append($$anchor, body);
	$.pop();
}