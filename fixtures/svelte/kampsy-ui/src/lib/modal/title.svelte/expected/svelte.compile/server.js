import * as $ from 'svelte/internal/server';

export default function Title($$renderer, $$props) {
	let { class: klass = "", children } = $$props;

	if (children) {
		$$renderer.push(`<!--[0--><h3${$.attr_class(`text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 text-[24px] leading-[32px] font-semibold ${$.stringify(klass)}`)}>`);
		children($$renderer);
		$$renderer.push(`<!----></h3>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}