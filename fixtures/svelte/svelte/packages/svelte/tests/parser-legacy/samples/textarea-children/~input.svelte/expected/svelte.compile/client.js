import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<textarea></textarea>`);

export default function Input($$anchor) {
	var textarea = root();

	$.remove_textarea_child(textarea);

	$.set_value(textarea, `	<p>not actually an element. ${foo ?? ''}</p>
`);

	$.append($$anchor, textarea);
}