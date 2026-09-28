import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import logo from './logo.svg';

var root = $.from_html(`<img alt="Svelte logo"/>`);

export default function _page($$anchor) {
	var img = root();

	$.template_effect(() => $.set_attribute(img, 'src', logo));
	$.append($$anchor, img);
}