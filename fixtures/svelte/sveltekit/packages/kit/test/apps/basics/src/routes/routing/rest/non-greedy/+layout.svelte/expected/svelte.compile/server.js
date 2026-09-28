import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	$$renderer.push(`<h1>non-greedy</h1> <!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--> <a href="/routing/rest/non-greedy/foo/one/two">foo/one/two</a> <a href="/routing/rest/non-greedy/food/one/two">food/one/two</a> <a href="/routing/rest/non-greedy/one-bar/two/three">one-bar/two/three</a> <a href="/routing/rest/non-greedy/one-bard/two/three">one-bard/two/three</a>`);
}