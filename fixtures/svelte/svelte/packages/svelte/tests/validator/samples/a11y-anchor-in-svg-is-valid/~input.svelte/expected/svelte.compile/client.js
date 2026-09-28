import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg><text><a>not actually a link</a></text></svg><svg><text><a xlink:href="">not actually a link</a></text></svg><svg><text><a xlink:href="#">not actually a link</a></text></svg>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}