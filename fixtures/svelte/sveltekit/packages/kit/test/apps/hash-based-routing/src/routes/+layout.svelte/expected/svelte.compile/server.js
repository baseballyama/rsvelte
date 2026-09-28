import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { setup } from '../../../../setup.js';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		setup();

		let { children } = $$props;

		$$renderer.push(`<a href="/">/</a> <a href="/#/a">/#/a</a> <a href="/#/b">/#/b</a> <a href="/#/a#b">/#/a#b</a> <a href="/#/b/123">/#/b/123</a> <a href="/#/b/456">/#/b/456</a> <a href="/#/reroute-a">/#/reroute-a</a> <a href="/#/reroute-b">/#/reroute-b</a> <button data-goto="">goto /#/b</button> <button data-shallow="">shallow /#/b</button> <button data-shallow-replace="">shallow replace /#/a#b</button> `);
		children($$renderer);
		$$renderer.push(`<!---->`);
	});
}