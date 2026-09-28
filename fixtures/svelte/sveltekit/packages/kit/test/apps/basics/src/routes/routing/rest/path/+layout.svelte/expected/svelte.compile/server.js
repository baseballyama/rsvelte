import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	$$renderer.push(`<a href="/routing/rest/path/one">one</a> <a href="/routing/rest/path/two">two</a> <a href="/routing/rest/path/three">three</a> <a href="/routing/rest/path/four">four</a> <a href="/routing/rest/path/five">five</a> <!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}