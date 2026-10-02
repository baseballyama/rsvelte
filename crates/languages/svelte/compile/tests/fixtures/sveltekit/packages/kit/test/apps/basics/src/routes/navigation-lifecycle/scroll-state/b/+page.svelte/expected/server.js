import * as $ from 'svelte/internal/server';
import { beforeNavigate, onNavigate, afterNavigate } from '$app/navigation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		$$renderer.push(`<h1>Page B</h1> <div style="height: 100vh; background: linear-gradient(orange, yellow)"></div> <a id="to-a" href="/navigation-lifecycle/scroll-state/a">Go to A</a> <div style="height: 100vh; background: linear-gradient(yellow, red)"></div>`);
	});
}