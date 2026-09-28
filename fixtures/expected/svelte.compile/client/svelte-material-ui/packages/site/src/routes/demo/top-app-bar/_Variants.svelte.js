import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<iframe class="top-app-bar-iframe svelte-gi7p1r" src="/demo/top-app-bar/iframe/standard" title="standard"></iframe> <a style="display: none;" href="/demo/top-app-bar/iframe/standard">helper needed for export</a> <iframe class="top-app-bar-iframe svelte-gi7p1r" src="/demo/top-app-bar/iframe/fixed" title="fixed"></iframe> <a style="display: none;" href="/demo/top-app-bar/iframe/fixed">helper needed for export</a> <iframe class="top-app-bar-iframe svelte-gi7p1r" src="/demo/top-app-bar/iframe/dense" title="dense"></iframe> <a style="display: none;" href="/demo/top-app-bar/iframe/dense">helper needed for export</a> <iframe class="top-app-bar-iframe svelte-gi7p1r" src="/demo/top-app-bar/iframe/prominent" title="prominent"></iframe> <a style="display: none;" href="/demo/top-app-bar/iframe/prominent">helper needed for export</a> <iframe class="top-app-bar-iframe svelte-gi7p1r" src="/demo/top-app-bar/iframe/short" title="short"></iframe> <a style="display: none;" href="/demo/top-app-bar/iframe/short">helper needed for export</a> <iframe class="top-app-bar-iframe svelte-gi7p1r" src="/demo/top-app-bar/iframe/short-closed" title="short closed"></iframe> <a style="display: none;" href="/demo/top-app-bar/iframe/short-closed">helper needed for export</a>`, 1);

export default function _Variants($$anchor) {
	var fragment = root();

	$.next(22);
	$.append($$anchor, fragment);
}