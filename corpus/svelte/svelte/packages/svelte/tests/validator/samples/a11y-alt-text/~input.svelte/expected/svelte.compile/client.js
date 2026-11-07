import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<img src="foo.jpg"/> <map><area/></map> <object></object> <input type="image"/> <input type="image" alt="hey"/>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.next(8);
	$.append($$anchor, fragment);
}