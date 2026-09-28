import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import emblaCarouselSvelte from 'embla-carousel-svelte';
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

var root = $.from_html(`<div data-slot="carousel-content" class="overflow-hidden"><div><!></div></div>`);

export default function Carousel_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const emblaCtx = getEmblaContext('<Carousel.Content/>');
	var div = root();
	var div_1 = $.child(div);

	$.attribute_effect(div_1, ($0) => ({ class: $0, 'data-embla-container': '', ...restProps }), [
		() => cn('flex', emblaCtx.orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col', $$props.class)
	]);

	var node = $.child(div_1);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div_1);
	$.bind_this(div_1, ($$value) => ref($$value), () => ref());
	$.reset(div);

	$.action(div, ($$node, $$action_arg) => emblaCarouselSvelte?.($$node, $$action_arg), () => ({
		options: {
			container: '[data-embla-container]',
			slides: '[data-embla-slide]',
			...emblaCtx.options,
			axis: emblaCtx.orientation === 'horizontal' ? 'x' : 'y'
		},
		plugins: emblaCtx.plugins
	}));

	$.event('emblaInit', div, function (...$$args) {
		emblaCtx.onInit?.apply(this, $$args);
	});

	$.append($$anchor, div);
	$.pop();
}