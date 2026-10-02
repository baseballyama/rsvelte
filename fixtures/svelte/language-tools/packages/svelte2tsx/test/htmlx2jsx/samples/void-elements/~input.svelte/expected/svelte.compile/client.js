import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<area/> <base/> <br/> <col/> <embed/> <hr/> <img/> <input/> <link/> <meta/> <param/> <source/> <track/> <wbr/>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(26);
	$.append($$anchor, fragment);
}