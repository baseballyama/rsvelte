import * as $ from 'svelte/internal/server';

export default function Empty_image($$renderer, $$props) {
	let { class: className = '' } = $$props;

	$$renderer.push(`<div${$.attr_class(`h-full w-full bg-gray-100 dark:bg-gray-800 ${className}`)}></div>`);
}