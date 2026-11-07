import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.with_script($.from_html(`<head><script type="text/javascript" id="" src="/some-script.js"></script> <link href="/style.css" rel="stylesheet"/> <script>console.log('foo')</script></head>`));

export default function Script_tag_input($$anchor) {
	var head = root();

	$.append($$anchor, head);
}