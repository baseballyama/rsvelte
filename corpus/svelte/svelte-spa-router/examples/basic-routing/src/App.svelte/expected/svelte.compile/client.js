import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Router from 'svelte-spa-router';
import routes from './routes';

var root = $.from_html(`<h1>svelte-spa-router sample</h1> <h2>Basic routing</h2> <ul><li><a href="#/">Home</a></li> <li><a href="#/hello/svelte">Say hi!</a></li> <li><a href="#/wild/card">Wildcard route</a></li> <li><a href="#/does/not/exist">Not found</a></li></ul> <!>`, 1);

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