import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'href',
	'type',
	'children',
	'disabled',
	'ref'
]);

export default function Button($$anchor, $$props) {
	$.push($$props, true);

	let disabled = $.prop($$props, 'disabled', 3, false),
		ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, () => $$props.href ? "a" : "button", false, ($$element, $$anchor) => {
		$.bind_this($$element, ($$value) => ref($$value), () => ref());

		$.attribute_effect($$element, () => ({
			'data-button-root': true,
			type: $$props.href ? undefined : $$props.type,
			href: $$props.href && !disabled() ? $$props.href : undefined,
			disabled: $$props.href ? undefined : disabled(),
			'aria-disabled': $$props.href ? disabled() : undefined,
			role: $$props.href && disabled() ? "link" : undefined,
			tabindex: $$props.href && disabled() ? -1 : 0,
			...restProps
		}));

		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.snippet(node_1, () => $$props.children ?? $.noop);
		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}