import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Router from 'svelte-spa-router';
import routes from './routes';

var root = $.from_html(`<h1>svelte-spa-router sample</h1> <h2>Dynamic imports</h2> <ul><li><a href="#/">Home</a></li> <li><a href="#/hello/svelte">Say hi!</a> (dynamically imported route)</li> <li><a href="#/wild/card">Wildcard route</a> (dynamically imported route, with a 5 seconds artificial delay)</li> <li><a href="#/does/not/exist">Not found</a></li></ul> <!>`, 1);

export default function App($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 6);

	Router(node, {
		get routes() {
			return routes;
		}
	});

	$.append($$anchor, fragment);
}