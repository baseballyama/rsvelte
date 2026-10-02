import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Img } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function RoundedCorners($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Img(node, {
		src: '/images/examples/image-1@2x.jpg',
		alt: 'sample 1',
		class: 'max-w-lg rounded-lg'
	});

	var node_1 = $.sibling(node, 2);

	Img(node_1, {
		src: '/images/examples/image-4@2x.jpg',
		alt: 'sample 1',
		class: 'h-96 w-96 rounded-full'
	});

	$.append($$anchor, fragment);
}