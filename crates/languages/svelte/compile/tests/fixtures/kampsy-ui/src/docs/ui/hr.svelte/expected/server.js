import * as $ from 'svelte/internal/server';

export default function Hr($$renderer, $$props) {
	let { class: klass = "" } = $$props;

	$$renderer.push(`<section${$.attr_class($.clsx(klass))}><div class="border-kui-light-gray-200 dark:border-kui-dark-gray-400 w-full border-t"></div></section>`);
}