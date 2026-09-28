import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>/B</h1> <div>was called: <span class="nav-lifecycle-after-nav-removed-test-target">false</span></div> <a href="/navigation-lifecycle/after-navigate-properly-removed/a">/a</a> <a href="/navigation-lifecycle/after-navigate-properly-removed/b">/b</a>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(6);
	$.append($$anchor, fragment);
}