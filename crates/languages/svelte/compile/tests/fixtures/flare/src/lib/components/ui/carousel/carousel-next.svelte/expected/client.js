import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
import { getEmblaContext } from './context.js';
import { cn } from '$lib/utils.js';
import { Button } from '$lib/components/ui/button/index.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'variant',
	'size'
]);

var root = $.from_html(`<!> <span class="sr-only">Next slide</span>`, 1);

export default function Carousel_next($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		variant = $.prop($$props, 'variant', 3, 'outline'),
		size = $.prop($$props, 'size', 3, 'icon'),
		restProps = $.rest_props($$props, rest_excludes);

	const emblaCtx = getEmblaContext('<Carousel.Next/>');

	{
		let $0 = $.derived(() => !emblaCtx.canScrollNext);

		let $1 = $.derived(() => cn(
			'absolute size-8 rounded-full',
			emblaCtx.orientation === 'horizontal'
				? 'top-1/2 -right-12 -translate-y-1/2'
				: '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
			$$props.class
		));

		Button($$anchor, $.spread_props(
			{
				'data-slot': 'carousel-next',
				get variant() {
					return variant();
				},

				get size() {
					return size();
				},

				get 'aria-disabled'() {
					return $.get($0);
				},

				get class() {
					return $.get($1);
				},

				get onclick() {
					return emblaCtx.scrollNext;
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

					ArrowRightIcon(node, { class: 'size-4' });
					$.next(2);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	}

	$.pop();
}