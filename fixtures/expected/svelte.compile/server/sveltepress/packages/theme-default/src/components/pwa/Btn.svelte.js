import * as $ from 'svelte/internal/server';

export default function Btn($$renderer, $$props) {
	const { flat = false, children, onclick } = $$props;

	$$renderer.push(`<div role="button"${$.attr_class('btn svelte-nkycr9', void 0, { 'primary': !flat, 'flat': flat })} tabindex="0">`);
	children?.($$renderer);
	$$renderer.push(`<!----></div>`);
}