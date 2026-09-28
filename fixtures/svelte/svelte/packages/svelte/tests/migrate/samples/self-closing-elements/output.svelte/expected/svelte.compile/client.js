import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div title="preserve"></div> <input type="text"/> <hr/> <f:table></f:table>`, 1);

export default function Output($$anchor) {
	var fragment = root();

	$.next(8);
	$.append($$anchor, fragment);
}