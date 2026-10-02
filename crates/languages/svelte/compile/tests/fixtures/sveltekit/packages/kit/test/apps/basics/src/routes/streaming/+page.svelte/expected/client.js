import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/streaming/universal">Universal</a> <a href="/streaming/server">Server</a> <a href="/streaming/server-error">Server Error</a> <a href="/streaming/server/delayed-rejection">Server Delayed Rejection</a>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(6);
	$.append($$anchor, fragment);
}