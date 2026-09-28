import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<img alt=""/>`);

export default function Main($$anchor, $$props) {
	var img = root();

	$.template_effect(() => $.set_attribute(img, 'src', $$props.src));
	$.append($$anchor, img);
}