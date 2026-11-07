import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import "./custom-button.js";

var root = $.from_html(`<button is="custom-button">click me</button>`, 2);

export default function Main($$anchor) {
	var button = root();

	$.append($$anchor, button);
}

customElements.define('custom-element', $.create_custom_element(Main, {}, [], [], { mode: 'open' }));