import * as $ from 'svelte/internal/server';
import { setDropdown } from './context.ts';

export default function DropdownRoot($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open = false, onOpenChange, children } = $$props;
		let triggerEl = null;
		let contentEl = null;

		const context = {
			get open() {
				return open;
			},

			set open(val) {
				open = val;
				onOpenChange?.(val);
			},

			get triggerEl() {
				return triggerEl;
			},

			set triggerEl(val) {
				triggerEl = val;
			},

			get contentEl() {
				return contentEl;
			},

			set contentEl(val) {
				contentEl = val;
			},

			close() {
				open = false;
				onOpenChange?.(false);
			},

			toggle() {
				open = !open;
				onOpenChange?.(open);
			},

			setTrigger(el) {
				triggerEl = el;
			},

			setContent(el) {
				contentEl = el;
			}
		};

		setDropdown(context);

		function handleOutsideClick(event) {
			if (!open) return;

			const target = event.target;

			if (triggerEl && !triggerEl.contains(target) && contentEl && !contentEl.contains(target)) {
				open = false;
				onOpenChange?.(false);
			}
		}

		$$renderer.push(`<div class="dropdown-root svelte-iwq79a">`);
		children($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { open });
	});
}