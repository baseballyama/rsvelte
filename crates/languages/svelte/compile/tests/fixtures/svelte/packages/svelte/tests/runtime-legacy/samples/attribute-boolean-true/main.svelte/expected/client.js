import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<textarea></textarea>`);

export default function Main($$anchor) {
	var textarea = root();

	textarea.readOnly = true;
	$.set_attribute(textarea, 'data-attr', true);
	$.append($$anchor, textarea);
}