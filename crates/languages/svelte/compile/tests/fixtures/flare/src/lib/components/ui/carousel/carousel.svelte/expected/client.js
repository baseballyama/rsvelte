import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setEmblaContext } from './context.js';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'opts',
	'plugins',
	'setApi',
	'orientation',
	'class',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function Carousel($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		opts = $.prop($$props, 'opts', 19, () => ({})),
		plugins = $.prop($$props, 'plugins', 19, () => []),
		setApi = $.prop($$props, 'setApi', 3, () => {}),
		orientation = $.prop($$props, 'orientation', 3, 'horizontal'),
		restProps = $.rest_props($$props, rest_excludes);

	let carouselState = $.proxy({
		api: undefined,
		scrollPrev,
		scrollNext,
		orientation: orientation(),
		canScrollNext: false,
		canScrollPrev: false,
		handleKeyDown,
		options: opts(),
		plugins: plugins(),
		onInit,
		scrollSnaps: [],
		selectedIndex: 0,
		scrollTo
	});

	setEmblaContext(carouselState);

	function scrollPrev() {
		carouselState.api?.scrollPrev();
	}

	function scrollNext() {
		carouselState.api?.scrollNext();
	}

	function scrollTo(index, jump) {
		carouselState.api?.scrollTo(index, jump);
	}

	function onSelect() {
		if (!carouselState.api) return;

		carouselState.selectedIndex = carouselState.api.selectedScrollSnap();
		carouselState.canScrollNext = carouselState.api.canScrollNext();
		carouselState.canScrollPrev = carouselState.api.canScrollPrev();
	}

	function handleKeyDown(e) {
		if (e.key === 'ArrowLeft') {
			e.preventDefault();
			scrollPrev();
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			scrollNext();
		}
	}

	function onInit(event) {
		carouselState.api = event.detail;
		setApi()(carouselState.api);
		carouselState.scrollSnaps = carouselState.api.scrollSnapList();
		carouselState.api.on('select', onSelect);
		onSelect();
	}

	$.user_effect(() => {
		return () => {
			carouselState.api?.off('select', onSelect);
		};
	});

	var div = root();

	$.attribute_effect(
		div,
		($0) => ({
			'data-slot': 'carousel',
			class: $0,
			role: 'region',
			'aria-roledescription': 'carousel',
			...restProps
		}),
		[() => cn('relative', $$props.class)]
	);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div);
	$.pop();
}