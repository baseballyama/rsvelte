import * as $ from 'svelte/internal/server';

export default function Link($$renderer, $$props) {
	let { href, type = "tertiary", children = undefined } = $$props;

	const typeObj = {
		primary: "text-kui-light-gray-1000 dark:text-kui-dark-gray-1000",
		secondary: "text-kui-light-gray-1000 dark:text-kui-dark-gray-1000",
		tertiary: "text-kui-light-gray-1000 dark:text-kui-dark-gray-1000",
		error: "text-kui-light-red-800 dark:text-kui-dark-red-800",
		warning: "text-kui-light-amber-800 dark:text-kui-dark-amber-800"
	};

	let typeClass = $.derived(() => {
		return typeObj[type];
	});

	if (children) {
		$$renderer.push(`<!--[0--><a${$.attr('href', href)} class="hover:bg-kui-light-gray-100 dark:hover:bg-kui-dark-gray-100 relative flex w-full cursor-pointer items-center rounded-md bg-transparent px-2 py-3.5 text-sm transition-colors lg:py-2.5"><span${$.attr_class(`first-letter:capitalize ${$.stringify(typeClass())}`)}>`);
		children($$renderer);
		$$renderer.push(`<!----></span></a>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}