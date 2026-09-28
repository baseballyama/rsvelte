import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getEmblaContext } from './context.js';
import { cn } from '$lib/utils.js';
import { Button } from '$lib/components/ui/button/index.js';
import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'variant',
	'size'
]);

var root = $.from_html(`<!> <span class="sr-only">Previous slide</span>`, 1);

export default function Carousel_previous($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		variant = $.prop($$props, 'variant', 3, 'outline'),
		size = $.prop($$props, 'size', 3, 'icon-sm'),
		restProps = $.rest_props($$props, rest_excludes);

	const emblaCtx = getEmblaContext('<Carousel.Previous/>');

	{
		let $0 = $.derived(() => !emblaCtx.canScrollPrev);
		let $1 = $.derived(() => !emblaCtx.canScrollPrev);

		let $2 = $.derived(() => cn(
			'absolute touch-manipulation rounded-full',
			emblaCtx.orientation === 'horizontal'
				? '-start-12 top-1/2 -translate-y-1/2'
				: 'start-1/2 -top-12 -translate-x-1/2 rotate-90',
			$$props.class
		));

		Button($$anchor, $.spread_props(
			{
				'data-slot': 'carousel-previous',
				get variant() {
					return variant();
				},

				get size() {
					return size();
				},

				get 'aria-disabled'() {
					return $.get($0);
				},

				get disabled() {
					return $.get($1);
				},

				get class() {
					return $.get($2);
				},

				get onclick() {
					return emblaCtx.scrollPrev;
				},

				get onkeydown() {
					return emblaCtx.handleKeyDown;
				}
			},
			() => restProps,
			{
				get ref() {
					return ref();
				},

				set ref($$value) {
					ref($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node = $.first_child(fragment_1);

					ChevronLeftIcon(node, {});
					$.next(2);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	}

	$.pop();
}