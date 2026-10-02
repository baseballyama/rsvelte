import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<form target="_blank"><button>Inside form</button></form> <form id="my-form"></form> <button formtarget="_blank" form="my-form">Outside form</button>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);
}