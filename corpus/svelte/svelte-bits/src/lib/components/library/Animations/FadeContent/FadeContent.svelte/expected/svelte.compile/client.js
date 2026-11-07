import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

var root = $.from_html(`<div><!></div>`);

export default function FadeContent($$anchor, $$props) {
	$.push($$props, true);
	gsap.registerPlugin(ScrollTrigger);

	let container = $.prop($$props, 'container', 3, null),
		blur = $.prop($$props, 'blur', 3, false),
		duration = $.prop($$props, 'duration', 3, 1000),
		ease = $.prop($$props, 'ease', 3, 'power2.out'),
		delay = $.prop($$props, 'delay', 3, 0),
		threshold = $.prop($$props, 'threshold', 3, 0.1),
		initialOpacity = $.prop($$props, 'initialOpacity', 3, 0),
		disappearAfter = $.prop($$props, 'disappearAfter', 3, 0),
		disappearDuration = $.prop($$props, 'disappearDuration', 3, 0.5),
		disappearEase = $.prop($$props, 'disappearEase', 3, 'power2.in'),
		className = $.prop($$props, 'class', 3, '');

	let el;

	onMount(() => {
		let scrollerTarget = container() || document.getElementById('snap-main-container') || null;

		if (typeof scrollerTarget === 'string') {
			scrollerTarget = document.querySelector(scrollerTarget);
		}

		const startPct = (1 - threshold()) * 100;
		const getSeconds = (val) => val > 10 ? val / 1000 : val;

		gsap.set(el, {
			autoAlpha: initialOpacity(),
			filter: blur() ? 'blur(10px)' : 'blur(0px)',
			willChange: 'opacity, filter, transform'
		});

		const tl = gsap.timeline({
			paused: true,
			delay: getSeconds(delay()),
			onComplete: () => {
				$$props.onComplete?.();

				if (disappearAfter() > 0) {
					gsap.to(el, {
						autoAlpha: initialOpacity(),
						filter: blur() ? 'blur(10px)' : 'blur(0px)',
						delay: getSeconds(disappearAfter()),
						duration: getSeconds(disappearDuration()),
						ease: disappearEase(),
						onComplete: () => $$props.onDisappearanceComplete?.()
					});
				}
			}
		});

		tl.to(el, {
			autoAlpha: 1,
			filter: 'blur(0px)',
			duration: getSeconds(duration()),
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
			gsap.killTweensOf(el);
		};
	});

	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.bind_this(div, ($$value) => el = $$value, () => el);
	$.template_effect(() => $.set_class(div, 1, $.clsx(className())));
	$.append($$anchor, div);
	$.pop();
}