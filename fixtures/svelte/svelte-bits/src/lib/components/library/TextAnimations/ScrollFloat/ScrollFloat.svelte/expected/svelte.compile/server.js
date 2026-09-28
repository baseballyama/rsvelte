import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function ScrollFloat($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		gsap.registerPlugin(ScrollTrigger);

		let {
			children = '',
			scrollContainer = null,
			containerClass = '',
			textClass = '',
			animationDuration = 1,
			ease = 'back.inOut(2)',
			scrollStart = 'center bottom+=50%',
			scrollEnd = 'bottom bottom-=40%',
			stagger = 0.03
		} = $$props;

		let containerRef;

		onMount(() => {
			if (!containerRef) return;

			const charElements = containerRef.querySelectorAll('.char');
			const scroller = scrollContainer || window;

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
					duration: animationDuration,
					ease,
					opacity: 1,
					yPercent: 0,
					scaleY: 1,
					scaleX: 1,
					stagger,
					scrollTrigger: {
						trigger: containerRef,
						scroller,
						start: scrollStart,
						end: scrollEnd,
						scrub: true
					}
				}
			);

			return () => {
				if (anim.scrollTrigger) anim.scrollTrigger.kill();

				anim.kill();
			};
		});

		const chars = $.derived(() => children.split(''));

		$$renderer.push(`<h2${$.attr_class(`scroll-float ${$.stringify(containerClass)}`, 'svelte-12wycj4')}><span${$.attr_class(`scroll-float-text ${$.stringify(textClass)}`, 'svelte-12wycj4')}><!--[-->`);

		const each_array = $.ensure_array_like(chars());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let char = each_array[$$index];

			$$renderer.push(`<span class="char svelte-12wycj4">${$.escape(char === ' ' ? '\u00A0' : char)}</span>`);
		}

		$$renderer.push(`<!--]--></span></h2>`);
	});
}