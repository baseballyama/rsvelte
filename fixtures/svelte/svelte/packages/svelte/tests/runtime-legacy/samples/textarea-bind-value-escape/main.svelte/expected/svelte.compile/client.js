import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<textarea></textarea>`);

export default function Main($$anchor) {
	let value = `test'"></textarea><script>alert('BIM');</` + `script>`;
	var textarea = root();

	$.remove_textarea_child(textarea);
	$.bind_value(textarea, () => value, ($$value) => value = $$value);
	$.append($$anchor, textarea);
}