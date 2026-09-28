import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<iframe class="bottom-app-bar-iframe svelte-17j6ft5" src="/demo/bottom-app-bar/iframe/inset-fab" title="inset-fab"></iframe> <a style="display: none;" href="/demo/bottom-app-bar/iframe/inset-fab">helper needed for export</a> <iframe class="bottom-app-bar-iframe svelte-17j6ft5" src="/demo/bottom-app-bar/iframe/inset-fab-right" title="inset-fab-right"></iframe> <a style="display: none;" href="/demo/bottom-app-bar/iframe/inset-fab-right">helper needed for export</a>`, 1);

export default function _InsetFab($$anchor) {
	var fragment = root();

	$.next(6);
	$.append($$anchor, fragment);
}