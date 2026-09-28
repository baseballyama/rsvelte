import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const testSnippet = ($$anchor) => {
	var p = root();

	$.append($$anchor, p);
};

var root = $.from_html(`<p>hi again</p>`);

export default function Main($$anchor) {
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, testSnippet));
	$.append($$anchor, text);
}