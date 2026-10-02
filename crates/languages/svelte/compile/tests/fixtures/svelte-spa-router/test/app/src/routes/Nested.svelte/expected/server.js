import * as $ from 'svelte/internal/server';
import Router from 'svelte-spa-router';
import Wild from './Wild.svelte';
import NotFound from './NotFound.svelte';

export default function Nested($$renderer) {
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

	$$renderer.push(`<h2 class="routetitle">Nested router</h2> `);
	Router($$renderer, { routes, prefix: '/nested' });
	$$renderer.push(`<!---->`);
}