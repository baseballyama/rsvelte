import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getEmblaContext } from './context.js';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function Carousel_item($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const emblaCtx = getEmblaContext('<Carousel.Item/>');
	var div = root();

	$.attribute_effect(
		div,
		($0) => ({
			'data-slot': 'carousel-item',
			role: 'group',
			'aria-roledescription': 'slide',
			class: $0,
			'data-embla-slide': '',
			...restProps
		}),
		[
			() => cn('min-w-0 shrink-0 grow-0 basis-full', emblaCtx.orientation === 'horizontal' ? 'ps-4' : 'pt-4', $$props.class)
		]
	);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div);
	$.pop();
}