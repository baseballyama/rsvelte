import * as $ from 'svelte/internal/server';

export default function Foo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { staticProp = null, onRouteEvent = () => {} } = $$props;

		if (staticProp) {
			$$renderer.push(`<!--[0--><p>We have a static prop: <b id="staticprop">${$.escape(staticProp)}</b></p> <button type="button" id="fooeventtrigger">Trigger route event from Foo</button>`);
		} else {
			$$renderer.push(`<!--[-1--><p>No static props here!</p>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}