import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a id="get-implicit" href="/errors/page-endpoint/get-implicit">GET (implicit)</a> <a id="get-explicit" href="/errors/page-endpoint/get-explicit">GET (explicit)</a> <form action="/errors/page-endpoint/post-implicit" method="post"><button type="submit" id="post-implicit">POST (implicit)</button></form> <form action="/errors/page-endpoint/post-explicit" method="post"><button type="submit" id="post-explicit">POST (explicit)</button></form>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(6);
	$.append($$anchor, fragment);
}