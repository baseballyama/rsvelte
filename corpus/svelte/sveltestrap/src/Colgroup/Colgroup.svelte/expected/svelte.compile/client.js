import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';

var root = $.from_html(`<colgroup><!></colgroup>`);

export default function Colgroup($$anchor, $$props) {
	$.push($$props, true);
	setContext('colgroup', true);

	var colgroup = root();
	var node = $.child(colgroup);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(colgroup);
	$.append($$anchor, colgroup);
	$.pop();
}