import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>redirects</h1> <a href="/redirect/a">a</a> <a href="/redirect/b">b</a> <a href="/redirect/loopy/a">a (loopy)</a> <a href="/redirect/loopy/b">b (loopy)</a> <a href="/redirect/missing-status/a">a (missing-status)</a> <a href="/redirect/missing-status/b">b (missing-status)</a> <a href="/redirect/in-handle?throw">in-handle (redirect)</a> <a href="/redirect/in-handle?response">in-handle (return Response)</a>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(16);
	$.append($$anchor, fragment);
}