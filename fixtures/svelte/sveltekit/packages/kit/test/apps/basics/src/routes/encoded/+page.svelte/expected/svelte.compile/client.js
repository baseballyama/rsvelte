import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/encoded/苗条">苗条</a> <a href="/encoded/土豆">土豆</a> <a href="/encoded/反应">反应</a> <a href="/encoded/redirect">Redirect</a> <a href="/encoded/@svelte">@svelte</a> <a href="/encoded/test%2520me">test%20me</a> <a href="/encoded/test%252fme">test%2fme</a> <a href="/encoded/AC%2fDC">AC/DC</a> <a href="/encoded/%5b">[</a>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(16);
	$.append($$anchor, fragment);
}