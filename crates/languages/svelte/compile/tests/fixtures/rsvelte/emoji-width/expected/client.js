import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>aaaaaaaaaa bbbbbbbbbb cccccccccc dddddddddd eeeeeeeeee ffffffffff gggggg 🚀🚀 hh</p> <p>aaaaaaaaaa bbbbbbbbbb cccccccccc dddddddddd eeeeeeeeee ffffffffff 👨‍👩‍👧 ggg hh</p> <p>aaaaaaaaaa bbbbbbbbbb cccccccccc dddddddddd eeeeeeeeee ffffffffff 日本語 ©️ hh</p>`, 1);

export default function Emoji_width($$anchor) {
	var fragment = root();
	$.next(4);
	$.append($$anchor, fragment);
}
