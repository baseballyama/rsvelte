import 'svelte/internal/disclose-version';
import { tv } from 'tailwind-variants';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

export const buttonGroupVariants = tv({
	base: "flex w-fit items-stretch has-[>[data-slot=button-group]]:gap-2 [&>*]:focus-visible:relative [&>*]:focus-visible:z-10 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
	variants: {
		orientation: {
			horizontal: '[&>[data-slot]]:rounded-r-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-md! [&>[data-slot]~[data-slot]]:rounded-l-none [&>[data-slot]~[data-slot]]:border-l-0',
			vertical: 'flex-col [&>[data-slot]]:rounded-b-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-md! [&>[data-slot]~[data-slot]]:rounded-t-none [&>[data-slot]~[data-slot]]:border-t-0'
		}
	},
	defaultVariants: { orientation: 'horizontal' }
});

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children',
	'orientation'
]);

var root = $.from_html(`<div><!></div>`);

export default function Button_group($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		orientation = $.prop($$props, 'orientation', 3, 'horizontal'),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root();

	$.attribute_effect(
		div,
		($0) => ({
			role: 'group',
			'data-slot': 'button-group',
			'data-orientation': orientation(),
			class: $0,
			...restProps
		}),
		[
			() => cn(buttonGroupVariants({ orientation: orientation() }), $$props.class)
		]
	);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div);
	$.pop();
}