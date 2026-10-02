import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

var root = $.from_html(`<div><!></div>`);

export default function AnimatedContent($$anchor, $$props) {
	$.push($$props, true);
	gsap.registerPlugin(ScrollTrigger);

	let container = $.prop($$props, 'container', 3, null),
		distance = $.prop($$props, 'distance', 3, 100),
		direction = $.prop($$props, 'direction', 3, 'vertical'),
		reverse = $.prop($$props, 'reverse', 3, false),
		duration = $.prop($$props, 'duration', 3, 0.8),
		ease = $.prop($$props, 'ease', 3, 'power3.out'),
		initialOpacity = $.prop($$props, 'initialOpacity', 3, 0),
		animateOpacity = $.prop($$props, 'animateOpacity', 3, true),
		scale = $.prop($$props, 'scale', 3, 1),
		threshold = $.prop($$props, 'threshold', 3, 0.1),
		delay = $.prop($$props, 'delay', 3, 0),
		disappearAfter = $.prop($$props, 'disappearAfter', 3, 0),
		disappearDuration = $.prop($$props, 'disappearDuration', 3, 0.5),
		disappearEase = $.prop($$props, 'disappearEase', 3, 'power3.in'),
		className = $.prop($$props, 'class', 3, '');

	let el;

	onMount(() => {
		let scrollerTarget = container() || document.getElementById('snap-main-container') || null;

		if (typeof scrollerTarget === 'string') {
			scrollerTarget = document.querySelector(scrollerTarget);
		}

		const axis = direction() === 'horizontal' ? 'x' : 'y';
		const offset = reverse() ? -distance() : distance();
		const startPct = (1 - threshold()) * 100;

		gsap.set(el, {
			[axis]: offset,
			scale: scale(),
			opacity: animateOpacity() ? initialOpacity() : 1,
			visibility: 'visible'
		});

		const tl = gsap.timeline({
			paused: true,
			delay: delay(),
			onComplete: () => {
				$$props.onComplete?.();

				if (disappearAfter() > 0) {
					gsap.to(el, {
						[axis]: reverse() ? distance() : -distance(),
						scale: 0.8,
						opacity: animateOpacity() ? initialOpacity() : 0,
						delay: disappearAfter(),
						duration: disappearDuration(),
						ease: disappearEase(),
						onComplete: () => $$props.onDisappearanceComplete?.()
					});
				}
			}
		});

		tl.to(el, {
			[axis]: 0,
			scale: 1,
			opacity: 1,
			duration: duration(),
			ease: ease()
		});

		const st = ScrollTrigger.create({
			trigger: el,
			scroller: scrollerTarget || window,
			start: `top ${startPct}%`,
			once: true,
			onEnter: () => tl.play()
		});

		return () => {
			st.kill();
			tl.kill();
		};
	});

	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.bind_this(div, ($$value) => el = $$value, () => el);
	$.template_effect(() => $.set_class(div, 1, `invisible ${className() ?? ''}`));
	$.append($$anchor, div);
	$.pop();
}