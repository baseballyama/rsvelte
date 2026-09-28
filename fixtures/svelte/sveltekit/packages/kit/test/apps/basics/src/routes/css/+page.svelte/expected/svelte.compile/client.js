import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import './_styles.css';
import './_manual.css?url';
import './_manual.css?raw';
import './_manual.css?inline';

var root = $.from_html(`<div class="styled">this text is red</div> <div class="also-styled svelte-1hh6m33">this text is blue</div> <div class="overridden">this text is green</div> <div class="not">this text is black</div> <a href="/css/other">other</a>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(8);
	$.append($$anchor, fragment);
}