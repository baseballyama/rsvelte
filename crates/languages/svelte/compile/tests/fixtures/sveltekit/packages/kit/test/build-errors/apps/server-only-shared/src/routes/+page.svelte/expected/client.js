import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { secret } from '#lib/secret.server.js';

var root = $.from_html(`<p> </p>`);

export default function _page($$anchor) {
	var // This server-only module is also imported by +page.server.js.
	// The guard must still detect this client-side import and report
	// "Cannot import ... into the browser" rather than following the
	// server branch and throwing "An impossible situation occurred".
	p = root();

	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, secret));
	$.append($$anchor, p);
}