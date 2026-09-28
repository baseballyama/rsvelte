import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Hello world!</h1>`);

export default function Main($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}

customElements.define('custom-element', $.create_custom_element(Main, {}, [], [], { mode: 'closed' }));