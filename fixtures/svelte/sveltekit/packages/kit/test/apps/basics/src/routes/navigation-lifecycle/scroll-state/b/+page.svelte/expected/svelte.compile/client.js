import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { beforeNavigate, onNavigate, afterNavigate } from '$app/navigation';

var root = $.from_html(`<h1>Page B</h1> <div style="height: 100vh; background: linear-gradient(orange, yellow)"></div> <a id="to-a" href="/navigation-lifecycle/scroll-state/a">Go to A</a> <div style="height: 100vh; background: linear-gradient(yellow, red)"></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	beforeNavigate((navigation) => {
		console.log('beforeNavigate:' + JSON.stringify({
			fromScroll: navigation.from?.scroll,
			toScroll: navigation.to?.scroll,
			type: navigation.type
		}));
	});

	onNavigate((navigation) => {
		console.log('onNavigate:' + JSON.stringify({
			fromScroll: navigation.from?.scroll,
			toScroll: navigation.to?.scroll,
			type: navigation.type
		}));
	});

	afterNavigate((navigation) => {
		console.log('afterNavigate:' + JSON.stringify({
			fromScroll: navigation.from?.scroll,
			toScroll: navigation.to?.scroll,
			type: navigation.type
		}));
	});

	var fragment = root();

	$.next(6);
	$.append($$anchor, fragment);
	$.pop();
}