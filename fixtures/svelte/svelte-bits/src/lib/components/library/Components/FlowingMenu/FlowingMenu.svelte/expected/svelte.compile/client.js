import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { gsap } from 'gsap';

var root_1 = $.from_html(`<div class="marquee-part flex items-center flex-shrink-0"><span class="whitespace-nowrap uppercase font-normal text-[4vh] leading-[1] px-[1vw]"> </span> <div class="w-[200px] h-[7vh] my-[2em] mx-[2vw] py-[1em] rounded-[50px] bg-cover bg-center"></div></div>`);
var root_2 = $.from_html(`<div class="flex-1 relative overflow-hidden text-center"><a class="flex items-center justify-center h-full relative cursor-pointer uppercase no-underline font-semibold text-[4vh]"> </a> <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none translate-y-[101%]"><div class="h-full w-fit flex"></div></div></div>`);
var root_3 = $.from_html(`<div class="w-full h-full overflow-hidden"><nav class="flex flex-col h-full m-0 p-0"></nav></div>`);

export default function FlowingMenu($$anchor, $$props) {
	$.push($$props, true);

	let items = $.prop($$props, 'items', 19, () => []),
		speed = $.prop($$props, 'speed', 3, 15),
		textColor = $.prop($$props, 'textColor', 3, '#fff'),
		bgColor = $.prop($$props, 'bgColor', 3, '#14110E'),
		marqueeBgColor = $.prop($$props, 'marqueeBgColor', 3, '#fff'),
		marqueeTextColor = $.prop($$props, 'marqueeTextColor', 3, '#14110E'),
		borderColor = $.prop($$props, 'borderColor', 3, '#fff');

	const itemRefs = [];
	const marqueeRefs = [];
	const marqueeInnerRefs = [];
	const animationRefs = [];
	let repetitions = $.state($.proxy([]));
	const animationDefaults = { duration: 0.6, ease: 'expo' };

	function findClosestEdge(mx, my, w, h) {
		const top = Math.pow(mx - w / 2, 2) + Math.pow(my, 2);
		const bot = Math.pow(mx - w / 2, 2) + Math.pow(my - h, 2);

		return top < bot ? 'top' : 'bottom';
	}

	onMount(() => {
		const calc = () => {
			$.set(
				repetitions,
				items().map((_, i) => {
					const inner = marqueeInnerRefs[i];

					if (!inner) return 4;

					const part = inner.querySelector('.marquee-part');

					if (!part) return 4;

					const cw = part.offsetWidth || 1;
					const needed = Math.ceil(window.innerWidth / cw) + 2;

					return Math.max(4, needed);
				}),
				true
			);
		};

		calc();

		const onResize = () => calc();

		window.addEventListener('resize', onResize);

		const timer = setTimeout(
			() => {
				items().forEach((_, i) => {
					const inner = marqueeInnerRefs[i];

					if (!inner) return;

					const part = inner.querySelector('.marquee-part');

					if (!part) return;

					const cw = part.offsetWidth;

					if (!cw) return;

					animationRefs[i]?.kill();
					animationRefs[i] = gsap.to(inner, { x: -cw, duration: speed(), ease: 'none', repeat: -1 });
				});
			},
			50
		);

		return () => {
			clearTimeout(timer);
			animationRefs.forEach((t) => t?.kill());
			window.removeEventListener('resize', onResize);
		};
	});

	function onEnter(ev, i) {
		const root = itemRefs[i];
		const m = marqueeRefs[i];
		const mi = marqueeInnerRefs[i];

		if (!root || !m || !mi) return;

		const r = root.getBoundingClientRect();
		const edge = findClosestEdge(ev.clientX - r.left, ev.clientY - r.top, r.width, r.height);

		gsap.timeline({ defaults: animationDefaults }).set(m, { y: edge === 'top' ? '-101%' : '101%' }, 0).set(mi, { y: edge === 'top' ? '101%' : '-101%' }, 0).to([m, mi], { y: '0%' }, 0);
	}

	function onLeave(ev, i) {
		const root = itemRefs[i];
		const m = marqueeRefs[i];
		const mi = marqueeInnerRefs[i];

		if (!root || !m || !mi) return;

		const r = root.getBoundingClientRect();
		const edge = findClosestEdge(ev.clientX - r.left, ev.clientY - r.top, r.width, r.height);

		gsap.timeline({ defaults: animationDefaults }).to(m, { y: edge === 'top' ? '-101%' : '101%' }, 0).to(mi, { y: edge === 'top' ? '101%' : '-101%' }, 0);
	}

	var div = root_3();
	var nav = $.child(div);

	$.each(nav, 21, items, $.index, ($$anchor, item, i) => {
		var div_1 = root_2();
		var a = $.child(div_1);
		var text = $.only_child(a, true);
		var div_2 = $.sibling(a, 2);
		var div_3 = $.child(div_2);

		$.each(div_3, 21, () => Array.from({ length: $.get(repetitions)[i] ?? 4 }), $.index, ($$anchor, _) => {
			var div_4 = root_1();
			var span = $.child(div_4);
			var text_1 = $.only_child(span, true);
			var div_5 = $.sibling(span, 2);

			$.reset(div_4);

			$.template_effect(() => {
				$.set_style(div_4, `color:${marqueeTextColor() ?? ''};`);
				$.set_text(text_1, $.get(item).text);
				$.set_style(div_5, `background-image:url(${$.get(item).image ?? ''});`);
			});

			$.append($$anchor, div_4);
		});

		$.reset(div_3);
		$.bind_this(div_3, ($$value, i) => marqueeInnerRefs[i] = $$value, (i) => marqueeInnerRefs?.[i], () => [i]);
		$.reset(div_2);
		$.bind_this(div_2, ($$value, i) => marqueeRefs[i] = $$value, (i) => marqueeRefs?.[i], () => [i]);
		$.reset(div_1);
		$.bind_this(div_1, ($$value, i) => itemRefs[i] = $$value, (i) => itemRefs?.[i], () => [i]);

		$.template_effect(() => {
			$.set_style(div_1, `border-top:${i === 0 ? 'none' : `1px solid ${borderColor()}`};`);
			$.set_attribute(a, 'href', $.get(item).link);
			$.set_style(a, `color:${textColor() ?? ''};`);
			$.set_text(text, $.get(item).text);
			$.set_style(div_2, `background-color:${marqueeBgColor() ?? ''};`);
		});

		$.event('mouseenter', a, (e) => onEnter(e, i));
		$.event('mouseleave', a, (e) => onLeave(e, i));
		$.append($$anchor, div_1);
	});

	$.reset(nav);
	$.reset(div);
	$.template_effect(() => $.set_style(div, `background-color:${bgColor() ?? ''};`));
	$.append($$anchor, div);
	$.pop();
}