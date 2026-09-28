import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

var root = $.from_html(`<span class="char svelte-12wycj4"> </span>`);
var root_1 = $.from_html(`<h2><span></span></h2>`);

export default function ScrollFloat($$anchor, $$props) {
	$.push($$props, true);
	gsap.registerPlugin(ScrollTrigger);

	let children = $.prop($$props, 'children', 3, ''),
		scrollContainer = $.prop($$props, 'scrollContainer', 3, null),
		containerClass = $.prop($$props, 'containerClass', 3, ''),
		textClass = $.prop($$props, 'textClass', 3, ''),
		animationDuration = $.prop($$props, 'animationDuration', 3, 1),
		ease = $.prop($$props, 'ease', 3, 'back.inOut(2)'),
		scrollStart = $.prop($$props, 'scrollStart', 3, 'center bottom+=50%'),
		scrollEnd = $.prop($$props, 'scrollEnd', 3, 'bottom bottom-=40%'),
		stagger = $.prop($$props, 'stagger', 3, 0.03);

	let containerRef;

	onMount(() => {
		if (!containerRef) return;

		const charElements = containerRef.querySelectorAll('.char');
		const scroller = scrollContainer() || window;

		const anim = gsap.fromTo(
			charElements,
			{
				willChange: 'opacity, transform',
				opacity: 0,
				yPercent: 120,
				scaleY: 2.3,
				scaleX: 0.7,
				transformOrigin: '50% 0%'
			},
			{
				duration: animationDuration(),
				ease: ease(),
				opacity: 1,
				yPercent: 0,
				scaleY: 1,
				scaleX: 1,
				stagger: stagger(),
				scrollTrigger: {
					trigger: containerRef,
					scroller,
					start: scrollStart(),
					end: scrollEnd(),
					scrub: true
				}
			}
		);

		return () => {
			if (anim.scrollTrigger) anim.scrollTrigger.kill();

			anim.kill();
		};
	});

	const chars = $.derived(() => children().split(''));
	var h2 = root_1();
	var span = $.child(h2);

	$.each(span, 21, () => $.get(chars), $.index, ($$anchor, char) => {
		var span_1 = root();
		var text = $.only_child(span_1, true);

		$.template_effect(() => $.set_text(text, $.get(char) === ' ' ? '\u00A0' : $.get(char)));
		$.append($$anchor, span_1);
	});

	$.reset(span);
	$.reset(h2);
	$.bind_this(h2, ($$value) => containerRef = $$value, () => containerRef);

	$.template_effect(() => {
		$.set_class(h2, 1, `scroll-float ${containerClass() ?? ''}`, 'svelte-12wycj4');
		$.set_class(span, 1, `scroll-float-text ${textClass() ?? ''}`, 'svelte-12wycj4');
	});

	$.append($$anchor, h2);
	$.pop();
}