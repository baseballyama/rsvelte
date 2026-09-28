import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<iframe class="bottom-app-bar-iframe svelte-1hfpi75" src="/demo/bottom-app-bar/iframe/standard" title="standard"></iframe> <a style="display: none;" href="/demo/bottom-app-bar/iframe/standard">helper needed for export</a> <iframe class="bottom-app-bar-iframe svelte-1hfpi75" src="/demo/bottom-app-bar/iframe/fixed" title="fixed"></iframe> <a style="display: none;" href="/demo/bottom-app-bar/iframe/fixed">helper needed for export</a>`, 1);

export default function _Variants($$anchor) {
	var fragment = root();

	$.next(6);
	$.append($$anchor, fragment);
}