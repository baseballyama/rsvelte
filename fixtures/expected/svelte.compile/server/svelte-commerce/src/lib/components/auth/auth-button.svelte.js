import * as $ from 'svelte/internal/server';
import { showAuthModal } from '@misiki/kitcommerce-core/components';

export default function Auth_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * Keyboard-reachable replacement for the vendored `AuthButton`
		 * (@misiki/kitcommerce-core/dist/components/auth/auth-button.svelte), which renders a
		 * `<div role="button">` with no `tabindex` and no key handler — so Tab skips it and
		 * Enter/Space never fire, i.e. login / signup / password reset are unreachable without a
		 * mouse (WCAG 2.1.1 A, 4.1.2 A).
		 *
		 * Same prop contract as the vendored component (`type`, `extraqueries`, children, and a
		 * `restProps` spread), so call sites only need their import swapped. The wrapper stays a
		 * `<div role="button">` rather than a `<button>` because most call sites pass block-level
		 * children, which are invalid inside a button.
		 */
		let {
			type,
			extraqueries,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		function handleClick() {
			showAuthModal(type, extraqueries);
		}

		$$renderer.push(`<div${$.attributes({
			role: 'button',
			tabindex: '0',
			'aria-label': 'Open authentication modal',
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}