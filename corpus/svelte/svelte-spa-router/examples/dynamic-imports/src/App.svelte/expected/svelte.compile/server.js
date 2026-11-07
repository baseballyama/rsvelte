import * as $ from 'svelte/internal/server';
import Router from 'svelte-spa-router';
import routes from './routes';

export default function App($$renderer) {
	$$renderer.push(`<h1>svelte-spa-router sample</h1> <h2>Dynamic imports</h2> <ul><li><a href="#/">Home</a></li> <li><a href="#/hello/svelte">Say hi!</a> (dynamically imported route)</li> <li><a href="#/wild/card">Wildcard route</a> (dynamically imported route, with a 5 seconds artificial delay)</li> <li><a href="#/does/not/exist">Not found</a></li></ul> `);
	Router($$renderer, { routes });
	$$renderer.push(`<!---->`);
	// Import the router component
	// Import the list of routes
}