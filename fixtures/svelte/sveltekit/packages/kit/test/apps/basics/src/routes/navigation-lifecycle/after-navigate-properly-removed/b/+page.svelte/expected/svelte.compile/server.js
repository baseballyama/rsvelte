import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<h1>/B</h1> <div>was called: <span class="nav-lifecycle-after-nav-removed-test-target">false</span></div> <a href="/navigation-lifecycle/after-navigate-properly-removed/a">/a</a> <a href="/navigation-lifecycle/after-navigate-properly-removed/b">/b</a>`);
}