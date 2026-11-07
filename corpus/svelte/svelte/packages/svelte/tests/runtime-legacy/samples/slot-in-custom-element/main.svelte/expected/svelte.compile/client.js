import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<custom-element><header slot="header">header header header</header></custom-element>`, 2);

export default function Main($$anchor) {
	var custom_element = root();

	$.append($$anchor, custom_element);
}