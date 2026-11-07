import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<iframe class="bottom-app-bar-iframe svelte-tc22d8" src="/demo/bottom-app-bar/iframe/snackbar" title="snackbar"></iframe> <a style="display: none;" href="/demo/bottom-app-bar/iframe/snackbar">helper needed for export</a>`, 1);

export default function _Snackbar($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}