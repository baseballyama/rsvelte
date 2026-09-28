import * as $ from 'svelte/internal/server';

export default function Decor_stripes($$renderer, $$props) {
	let { class: classList, children } = $$props;

	$$renderer.push(`<section${$.attr_class($.clsx(['stripes', classList]), 'svelte-1kmb2yx')}>`);
	children?.($$renderer);
	$$renderer.push(`<!----></section>`);
}