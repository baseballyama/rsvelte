import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'meta',
	'ref'
]);

var root = $.from_html(`<div><!></div>`);

export default function Component_card($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15),
		rest = $.rest_props($$props, rest_excludes);

	const layoutClasses = $.derived(() => {
		switch ($$props.meta?.layout) {
			case 'full':
				return 'col-span-12';

			case 'wide':
				return 'col-span-12 sm:col-span-6 lg:col-span-6';

			default:
				return 'col-span-12 sm:col-span-6 lg:col-span-4';
		}
	});

	const styleClasses = $.derived(() => {
		switch ($$props.meta?.style) {
			case 'centered':
				return 'flex items-center justify-center';

			case 'text-center':
				return 'text-center';

			default:
				return '';
		}
	});

	const overflowClasses = $.derived(() => {
		return $$props.meta?.overflow ? 'overflow-auto' : '';
	});

	var div = root();

	$.attribute_effect(
		div,
		($0) => ({ class: $0, ...rest }),
		[
			() => cn('group/item relative border', $.get(layoutClasses), $.get(styleClasses), $.get(overflowClasses), $$props.class)
		],
		void 0,
		void 0,
		'svelte-e8uynz'
	);

	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div);
	$.pop();
}