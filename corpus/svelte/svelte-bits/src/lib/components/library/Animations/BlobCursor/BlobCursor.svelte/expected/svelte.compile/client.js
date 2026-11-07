import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { gsap } from 'gsap';

var root = $.from_svg(`<svg class="absolute w-0 h-0" aria-hidden="true"><filter><feGaussianBlur in="SourceGraphic" result="blur"></feGaussianBlur><feColorMatrix in="blur"></feColorMatrix></filter></svg>`);
var root_1 = $.from_html(`<div class="absolute will-change-transform transform -translate-x-1/2 -translate-y-1/2"><div class="absolute"></div></div>`);
var root_2 = $.from_html(`<div role="presentation" class="absolute inset-0"><!> <div class="pointer-events-none absolute inset-0 overflow-hidden select-none cursor-default"></div></div>`);

export default function BlobCursor($$anchor, $$props) {
	$.push($$props, true);

	let blobType = $.prop($$props, 'blobType', 3, 'circle'),
		fillColor = $.prop($$props, 'fillColor', 3, '#FF8A4C'),
		trailCount = $.prop($$props, 'trailCount', 3, 3),
		sizes = $.prop($$props, 'sizes', 19, () => [60, 125, 75]),
		innerSizes = $.prop($$props, 'innerSizes', 19, () => [20, 35, 25]),
		innerColor = $.prop($$props, 'innerColor', 3, 'rgba(255,255,255,0.8)'),
		opacities = $.prop($$props, 'opacities', 19, () => [0.6, 0.6, 0.6]),
		shadowColor = $.prop($$props, 'shadowColor', 3, 'rgba(0,0,0,0.75)'),
		shadowBlur = $.prop($$props, 'shadowBlur', 3, 5),
		shadowOffsetX = $.prop($$props, 'shadowOffsetX', 3, 10),
		shadowOffsetY = $.prop($$props, 'shadowOffsetY', 3, 10),
		filterId = $.prop($$props, 'filterId', 3, 'blob'),
		filterStdDeviation = $.prop($$props, 'filterStdDeviation', 3, 30),
		filterColorMatrixValues = $.prop($$props, 'filterColorMatrixValues', 3, '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 35 -10'),
		useFilter = $.prop($$props, 'useFilter', 3, true),
		fastDuration = $.prop($$props, 'fastDuration', 3, 0.1),
		slowDuration = $.prop($$props, 'slowDuration', 3, 0.5),
		fastEase = $.prop($$props, 'fastEase', 3, 'power3.out'),
		slowEase = $.prop($$props, 'slowEase', 3, 'power1.out'),
		zIndex = $.prop($$props, 'zIndex', 3, 100);

	let container;
	const blobs = $.proxy(Array(trailCount()).fill(null));

	function move(e) {
		if (!container) return;

		const rect = container.getBoundingClientRect();
		const x = 'clientX' in e ? e.clientX : e.touches[0].clientX;
		const y = 'clientY' in e ? e.clientY : e.touches[0].clientY;

		blobs.forEach((el, i) => {
			if (!el) return;

			const isLead = i === 0;

			gsap.to(el, {
				x: x - rect.left,
				y: y - rect.top,
				duration: isLead ? fastDuration() : slowDuration(),
				ease: isLead ? fastEase() : slowEase()
			});
		});
	}

	var div = root_2();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var svg = root();
			var filter = $.child(svg);
			var feGaussianBlur = $.child(filter);
			var feColorMatrix = $.sibling(feGaussianBlur);

			$.reset(filter);
			$.reset(svg);

			$.template_effect(() => {
				$.set_attribute(filter, 'id', filterId());
				$.set_attribute(feGaussianBlur, 'stdDeviation', filterStdDeviation());
				$.set_attribute(feColorMatrix, 'values', filterColorMatrixValues());
			});

			$.append($$anchor, svg);
		};

		$.if(node, ($$render) => {
			if (useFilter()) $$render(consequent);
		});
	}

	var div_1 = $.sibling(node, 2);

	$.each(div_1, 21, () => Array(trailCount()), $.index, ($$anchor, _, i) => {
		var div_2 = root_1();
		var div_3 = $.only_child(div_2);

		$.bind_this(div_2, ($$value, i) => blobs[i] = $$value, (i) => blobs?.[i], () => [i]);

		$.template_effect(() => {
			$.set_style(div_2, `width:${sizes()[i] ?? ''}px;height:${sizes()[i] ?? ''}px;border-radius:${blobType() === 'circle' ? '50%' : '0'};background-color:${fillColor() ?? ''};opacity:${opacities()[i] ?? ''};box-shadow:${shadowOffsetX() ?? ''}px ${shadowOffsetY() ?? ''}px ${shadowBlur() ?? ''}px 0 ${shadowColor() ?? ''};`);
			$.set_style(div_3, `width:${innerSizes()[i] ?? ''}px;height:${innerSizes()[i] ?? ''}px;top:${(sizes()[i] - innerSizes()[i]) / 2}px;left:${(sizes()[i] - innerSizes()[i]) / 2}px;background-color:${innerColor() ?? ''};border-radius:${blobType() === 'circle' ? '50%' : '0'};`);
		});

		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(div);
	$.bind_this(div, ($$value) => container = $$value, () => container);

	$.template_effect(() => {
		$.set_style(div, `z-index:${zIndex() ?? ''};`);
		$.set_style(div_1, useFilter() ? `filter:url(#${filterId()});` : '');
	});

	$.delegated('mousemove', div, move);
	$.delegated('touchmove', div, move, void 0, true);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['mousemove', 'touchmove']);