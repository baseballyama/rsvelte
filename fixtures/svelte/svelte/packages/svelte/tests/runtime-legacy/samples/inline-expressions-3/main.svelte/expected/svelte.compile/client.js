import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { sprites } from './sprites.js';

var root = $.from_html(`<div><svg width="13" height="14" aria-hidden="true"><use></use></svg></div>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var svg = $.child(div);
	var use = $.only_child(svg);

	$.reset(div);
	$.template_effect(() => $.set_xlink_attribute(use, 'xlink:href', `${sprites['a'] ?? ''}#done`));
	$.append($$anchor, div);
	$.pop();
}