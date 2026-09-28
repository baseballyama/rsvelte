import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span title="&quot;foo&quot;">foo <span title="&quot;bar&quot;">bar</span></span>`);

export default function Main($$anchor) {
	var span = root();

	$.append($$anchor, span);
}