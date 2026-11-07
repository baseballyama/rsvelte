import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<iframe class="data-table-iframe svelte-h0zucd" src="/demo/data-table/iframe" title="standard"></iframe> <a style="display: none;" href="/demo/data-table/iframe">helper needed for sapper export</a>`, 1);

export default function _StickyHeader($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}