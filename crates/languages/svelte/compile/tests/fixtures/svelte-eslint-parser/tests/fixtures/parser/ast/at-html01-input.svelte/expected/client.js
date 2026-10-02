import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function At_html01_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.html(node, () => `<script>var x = ${50}</script>`);
	$.append($$anchor, fragment);
}