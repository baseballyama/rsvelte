import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { items } from './data.js';

var root = $.from_html(`<p>child</p>`);

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	const myArr = items;
	var $$exports = { myArr };
	var p = root();

	$.append($$anchor, p);

	return $.pop($$exports);
}