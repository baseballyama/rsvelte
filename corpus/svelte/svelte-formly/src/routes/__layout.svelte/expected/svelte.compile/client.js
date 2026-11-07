import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import '@picocss/pico/css/pico.css';
import '@picocss/pico/docs/css/pico.docs.css';
import '../_variables.scss';

var root = $.from_html(`<div class="container"><!></div>`);

export default function __layout($$anchor, $$props) {
	var div = root();
	var node = $.child(div);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(div);
	$.append($$anchor, div);
}