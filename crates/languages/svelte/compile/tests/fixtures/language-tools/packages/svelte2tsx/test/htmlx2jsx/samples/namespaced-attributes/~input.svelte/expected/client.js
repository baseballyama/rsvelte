import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<use></use>`);

export default function Input($$anchor) {
	var use = root();

	$.set_xlink_attribute(use, 'xlink:href', test);
	$.append($$anchor, use);
}