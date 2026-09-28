import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Ripple from '@smui/ripple';

var root = $.from_html(`<p class="svelte-2ngptc"><span tabindex="0" role="button">D</span> <span tabindex="0" role="button">P</span> <span tabindex="0" role="button">S</span></p>`);

export default function _Unbounded($$anchor, $$props) {
	$.push($$props, true);

	let rippleClasses = $.proxy({});
	let primaryRippleClasses = $.proxy({});
	let secondaryRippleClasses = $.proxy({});
	var p = root();
	var span = $.child(p);

	$.action(span, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), () => ({
		surface: true,
		unbounded: true,
		addClass: (className) => {
			if (!rippleClasses[className]) {
				rippleClasses[className] = true;
			}
		},

		removeClass: (className) => {
			if (rippleClasses[className]) {
				delete rippleClasses[className];
			}
		}
	}));

	var span_1 = $.sibling(span, 2);

	$.action(span_1, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), () => ({
		surface: true,
		unbounded: true,
		color: 'primary',
		// addClass and removeClass need to be provided, since
		// we have a "class" attribute on this element. If we had
		// a "style" attribute, we would also need addStyle.
		addClass: (className) => {
			if (!primaryRippleClasses[className]) {
				primaryRippleClasses[className] = true;
			}
		},

		removeClass: (className) => {
			if (primaryRippleClasses[className]) {
				delete primaryRippleClasses[className];
			}
		}
	}));

	var span_2 = $.sibling(span_1, 2);

	$.action(span_2, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), () => ({
		surface: true,
		unbounded: true,
		color: 'secondary',
		// addClass and removeClass need to be provided, since
		// we have a "class" attribute on this element. If we had
		// a "style" attribute, we would also need addStyle.
		addClass: (className) => {
			if (!secondaryRippleClasses[className]) {
				secondaryRippleClasses[className] = true;
			}
		},

		removeClass: (className) => {
			if (secondaryRippleClasses[className]) {
				delete secondaryRippleClasses[className];
			}
		}
	}));

	$.reset(p);

	$.template_effect(
		($0, $1, $2) => {
			$.set_class(span, 1, `unbounded ${$0 ?? ''}`, 'svelte-2ngptc');
			$.set_class(span_1, 1, `unbounded ${$1 ?? ''}`, 'svelte-2ngptc');
			$.set_class(span_2, 1, `unbounded ${$2 ?? ''}`, 'svelte-2ngptc');
		},
		[
			() => Object.keys(rippleClasses).join(' '),
			() => Object.keys(primaryRippleClasses).join(' '),
			() => Object.keys(secondaryRippleClasses).join(' ')
		]
	);

	$.append($$anchor, p);
	$.pop();
}