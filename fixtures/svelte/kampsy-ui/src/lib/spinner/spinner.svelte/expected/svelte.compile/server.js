import * as $ from 'svelte/internal/server';
import { LoaderCircle } from "$lib/icons/index.js";
import { fade } from "svelte/transition";

export default function Spinner($$renderer, $$props) {
	let { size = 20 } = $$props;

	let sizeStyle = $.derived(() => {
		return `width: ${size}px; height: ${size}px;`;
	});

	$$renderer.push(`<div><div${$.attr_style(sizeStyle())} class="relative flex animate-spin items-center justify-center"><div class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 absolute h-full w-full">`);
	LoaderCircle($$renderer, {});
	$$renderer.push(`<!----></div></div></div>`);
}