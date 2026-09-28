import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setEmblaContext } from './context.js';
import { cn } from '$lib/core/utils/index.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
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

	let opts = $.prop($$props, 'opts', 19, () => ({})),
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

	function onSelect(api) {
		if (!api) return;

		carouselState.canScrollPrev = api.canScrollPrev();
		carouselState.canScrollNext = api.canScrollNext();
		carouselState.selectedIndex = api.selectedScrollSnap();
	}

	$.user_effect(() => {
		if (carouselState.api) {
			onSelect(carouselState.api);
			carouselState.api.on('select', onSelect);
			carouselState.api.on('reInit', onSelect);
		}
	});

	function handleKeyDown(e) {
		if (e.key === 'ArrowLeft') {
			e.preventDefault();
			scrollPrev();
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			scrollNext();
		}
	}

	$.user_effect(() => {
		setApi()(carouselState.api);
	});

	function onInit(event) {
		carouselState.api = event.detail;
		carouselState.scrollSnaps = carouselState.api.scrollSnapList();
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
	$.append($$anchor, div);
	$.pop();
}