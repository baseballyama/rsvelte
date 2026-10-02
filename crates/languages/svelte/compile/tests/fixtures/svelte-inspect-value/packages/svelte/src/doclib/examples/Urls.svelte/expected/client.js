import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from '$lib/index.js';
import { getContext } from 'svelte';

var root = $.from_html(`<div class="flex col"><h3 id="urls">URLs</h3> <!></div>`);

export default function Urls($$anchor, $$props) {
	$.push($$props, true);
	getContext('toc')?.set('URLs', 'urls');

	var div = root();
	var node = $.sibling($.child(div), 2);

	$.component(node, () => Inspect.Values.Expand0, ($$anchor, Inspect_Values_Expand0) => {
		Inspect_Values_Expand0($$anchor, $.spread_props({
			url: new URL('https://subdomain.example.org/about'),
			fullyFeaturedUrl: new URL('https://anon:hunter2@example.org:8080/pathname/index.html?q=query&p=123&buh#result'),
			search: new URLSearchParams([
				['a', '1'],
				['a', '2'],
				['b', '3'],
				['b', '4'],
				['c', '5'],
				['query', 'elephants']
			])
		}));
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}