import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<textarea></textarea>`);

export default function Main($$anchor) {
	var textarea = root();

	$.remove_textarea_child(textarea);
	$.set_value(textarea, `test'"></textarea><script>alert('BIM');</script>`);
	$.append($$anchor, textarea);
}