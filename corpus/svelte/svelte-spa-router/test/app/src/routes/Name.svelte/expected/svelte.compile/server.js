import * as $ from 'svelte/internal/server';

export default function Name($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { params = {}, onRouteEvent = () => {} } = $$props;

		$$renderer.push(`<h2 class="routetitle">Hi there!</h2> <p id="nameparams">Your name is: <b>${$.escape(params.first ?? 'null')}</b> <b>`);

		if (params.last) {
			$$renderer.push(`<!--[0-->${$.escape(params.last)}`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></b></p> <p><em>Hint:</em> Try changing the URL and add your name, e.g. <code>/hello/jane/doe</code></p>`);
	});
}