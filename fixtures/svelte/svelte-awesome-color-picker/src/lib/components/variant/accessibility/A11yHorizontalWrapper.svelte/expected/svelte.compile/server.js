import * as $ from 'svelte/internal/server';

export default function A11yHorizontalWrapper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** DOM element of the Color Picker popup wrapper */
		/** indicator of the popup state */
		/** if set to true, the wrapper should have a dialog role and be absolute. It should be relative otherwise */
		/** children */
		let { wrapper = void 0, isOpen, isDialog, children } = $$props;

		$$renderer.push(`<div${$.attr_class('wrapper svelte-h6u3ly', void 0, { 'is-open': isOpen })}${$.attr('role', isDialog ? 'dialog' : undefined)} aria-label="color picker">`);
		children($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { wrapper });
	});
}