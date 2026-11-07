import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Router from 'svelte-spa-router';
import Wild from './Wild.svelte';
import NotFound from './NotFound.svelte';

var root = $.from_html(`<h2 class="routetitle">Nested router</h2> <!>`, 1);

export default function Nested($$anchor) {
	// Import the router component
	// Routes
	// Nested routes, but note the prefix /nested passed to the router above
	const routes = {
		// Wildcard parameter
		'/wild': Wild,
		'/wild/*': Wild,
		// Catch-all, must be last
		'*': NotFound
	};

	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	Router(node, {
		get routes() {
			return routes;
		},
		prefix: '/nested'
	});

	$.append($$anchor, fragment);
}