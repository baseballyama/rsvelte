import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { showAuthModal } from '@misiki/kitcommerce-core/components';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'type',
	'extraqueries',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function Auth_button($$anchor, $$props) {
	$.push($$props, true);

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
	let restProps = $.rest_props($$props, rest_excludes);

	function handleClick() {
		showAuthModal($$props.type, $$props.extraqueries);
	}

	var div = root();

	var event_handler = (e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleClick();
		}
	};

	$.attribute_effect(div, () => ({
		role: 'button',
		tabindex: '0',
		'aria-label': 'Open authentication modal',
		onclick: handleClick,
		onkeydown: event_handler,
		...restProps
	}));

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}