import * as $ from 'svelte/internal/server';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

export default function SplitText($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			text,
			class: className = '',
			delay = 50,
			duration = 1.25,
			ease = 'power3.out',
			splitType = 'chars',
			from = { opacity: 0, y: 40 },
			to = { opacity: 1, y: 0 },
			threshold = 0.1,
			rootMargin = '-100px',
			tag = 'p',
			textAlign = 'center',
			onLetterAnimationComplete
		} = $$props;

		let el;
		let fontsLoaded = false;
		let animationCompleted = false;
		let onCompleteRef = $.derived(() => onLetterAnimationComplete);

		$.element(
			$$renderer,
			// GSAP may already have reverted during teardown.
			// GSAP may already have reverted during teardown.
			tag,
			() => {
				$$renderer.push(`${$.attr_class(`split-parent overflow-hidden inline-block whitespace-normal ${$.stringify(className)}`)}${$.attr_style('', {
					'text-align': textAlign,
					'word-wrap': 'break-word',
					'will-change': 'transform, opacity'
				})}`);
			},
			() => {
				$$renderer.push(`${$.escape(text)}`);
			}
		);
	});
}