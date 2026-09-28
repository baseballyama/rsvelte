import * as $ from 'svelte/internal/server';

export default function Wrapper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** DOM element of the wrapper element */
		/** indicator of the popup state */
		/** if set to true, the wrapper should have a dialog role and be absolute. It should be relative otherwise */
		/** children */
		let { wrapper = void 0, isOpen, isDialog, children } = $$props;

		$$renderer.push(`<div${$.attr_class('wrapper svelte-rvh4bn', void 0, { 'is-open': isOpen })}${$.attr('role', isDialog ? 'dialog' : undefined)} aria-label="color picker">`);
		children($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { wrapper });
	});
}