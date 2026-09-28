import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import '../app.css';

var root = $.from_html(`<main class="svelte-13uav2n"><!></main>`);

export default function _layout($$anchor, $$props) {
	var main = root();
	var node = $.child(main);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(main);
	$.append($$anchor, main);
}