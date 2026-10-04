import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

import "./custom-button.js";

var root = $.from_html(`<button is="custom-button">Click</button>`, 2);

export default function Options_custom_extended_builtin($$anchor) {
	var button = root();
	$.append($$anchor, button);
}

customElements.define('my-element', $.create_custom_element(Options_custom_extended_builtin, {}, [], [], { mode: 'open' }));
