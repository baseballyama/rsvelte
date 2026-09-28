import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<area alt=""/> <base/> <br/> <col/> <embed/> <hr/> <img alt=""/> <input/> <keygen/> <link/> <meta/> <param/> <source/> <track/> <wbr/>`, 1);

export default function Main($$anchor) {
	var fragment = root();

	$.next(28);
	$.append($$anchor, fragment);
}