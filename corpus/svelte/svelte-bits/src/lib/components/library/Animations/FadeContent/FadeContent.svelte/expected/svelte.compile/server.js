import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function FadeContent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		gsap.registerPlugin(ScrollTrigger);

		let {
			children,
			container = null,
			blur = false,
			duration = 1000,
			ease = 'power2.out',
			delay = 0,
			threshold = 0.1,
			initialOpacity = 0,
			disappearAfter = 0,
			disappearDuration = 0.5,
			disappearEase = 'power2.in',
			onComplete,
			onDisappearanceComplete,
			class: className = ''
		} = $$props;

		let el;

		onMount(() => {
			let scrollerTarget = container || document.getElementById('snap-main-container') || null;

			if (typeof scrollerTarget === 'string') {
				scrollerTarget = document.querySelector(scrollerTarget);
			}

			const startPct = (1 - threshold) * 100;
			const getSeconds = (val) => val > 10 ? val / 1000 : val;

			gsap.set(el, {
				autoAlpha: initialOpacity,
				filter: blur ? 'blur(10px)' : 'blur(0px)',
				willChange: 'opacity, filter, transform'
			});

			const tl = gsap.timeline({
				paused: true,
				delay: getSeconds(delay),
				onComplete: () => {
					onComplete?.();

					if (disappearAfter > 0) {
						gsap.to(el, {
							autoAlpha: initialOpacity,
							filter: blur ? 'blur(10px)' : 'blur(0px)',
							delay: getSeconds(disappearAfter),
							duration: getSeconds(disappearDuration),
							ease: disappearEase,
							onComplete: () => onDisappearanceComplete?.()
						});
					}
				}
			});

			tl.to(el, {
				autoAlpha: 1,
				filter: 'blur(0px)',
				duration: getSeconds(duration),
				ease
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

		$$renderer.push(`<div${$.attr_class($.clsx(className))}>`);
		children($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}