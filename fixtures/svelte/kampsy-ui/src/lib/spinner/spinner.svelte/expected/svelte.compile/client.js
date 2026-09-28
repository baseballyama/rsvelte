import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LoaderCircle } from "$lib/icons/index.js";
import { fade } from "svelte/transition";

var root = $.from_html(`<div><div class="relative flex animate-spin items-center justify-center"><div class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 absolute h-full w-full"><!></div></div></div>`);

export default function Spinner($$anchor, $$props) {
	let size = $.prop($$props, 'size', 3, 20);

	let sizeStyle = $.derived(() => {
		return `width: ${size()}px; height: ${size()}px;`;
	});

	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	LoaderCircle(node, {});
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_style(div_1, $.get(sizeStyle)));
	$.transition(3, div_2, () => fade);
	$.append($$anchor, div);
}