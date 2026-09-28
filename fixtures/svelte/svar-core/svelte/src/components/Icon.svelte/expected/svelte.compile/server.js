import * as $ from 'svelte/internal/server';

export default function Icon($$renderer, $$props) {
	let { css = "", title = "", tooltip, children, onclick } = $$props;

	if (children) {
		$$renderer.push(`<!--[0--><i${$.attr('title', title)} role="img"${$.attr_class(`wx-icon ${$.stringify(css)}`, 'svelte-1tklajd')}${$.attr('data-tooltip-text', tooltip)}>`);
		children($$renderer);
		$$renderer.push(`<!----></i>`);
	} else {
		$$renderer.push(`<!--[-1--><i${$.attr('title', title)}${$.attr_class(`wx-icon ${$.stringify(css)}`, 'svelte-1tklajd')}${$.attr('data-tooltip-text', tooltip)}></i>`);
	}

	$$renderer.push(`<!--]-->`);
}