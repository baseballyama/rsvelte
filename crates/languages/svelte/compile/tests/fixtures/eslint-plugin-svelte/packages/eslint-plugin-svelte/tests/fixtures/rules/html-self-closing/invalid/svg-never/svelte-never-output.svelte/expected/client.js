import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg><path></path></svg><math><msup></msup></math>`, 1);

export default function Svelte_never_output($$anchor) {
	var fragment = root();

	$.next();
	$.append($$anchor, fragment);
}