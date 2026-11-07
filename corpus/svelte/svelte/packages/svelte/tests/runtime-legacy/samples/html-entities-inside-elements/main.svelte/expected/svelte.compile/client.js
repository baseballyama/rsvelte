import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>this &lt;em&gt;should&lt;/em&gt; not be <span>&lt;strong&gt;bold&lt;/strong&gt;</span></p>`);

export default function Main($$anchor) {
	var p = root();

	$.append($$anchor, p);
}