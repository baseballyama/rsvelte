import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<img alt="Kitten wants to know what's going on" src="tutorial/kitten.png"/>`);

export default function Svelte_body_input($$anchor) {
	let hereKitty = false;
	const handleMouseenter = () => hereKitty = true;
	const handleMouseleave = () => hereKitty = false;
	var img = root();

	$.event('mouseenter', $.document.body, handleMouseenter);
	$.event('mouseleave', $.document.body, handleMouseleave);

	let classes;

	$.template_effect(() => classes = $.set_class(img, 1, 'svelte-kzurz4', null, classes, { curious: hereKitty }));
	$.append($$anchor, img);
}