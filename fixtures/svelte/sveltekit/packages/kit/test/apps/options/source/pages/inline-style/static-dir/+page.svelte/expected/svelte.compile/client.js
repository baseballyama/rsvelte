import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(
	`<div class="svelte-16rk2mg"></div> <p>Assets located in the static directory have their URL path transformed to '../../../asset.png'
	instead of './asset.png' like most assets that go through Vite's static asset handling</p>`,
	1
);

export default function _page($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}