import * as $ from 'svelte/internal/server';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

export default function Shuffle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			text,
			class: className = '',
			style = '',
			shuffleDirection = 'right',
			duration = 0.35,
			maxDelay = 0,
			ease = 'power3.out',
			threshold = 0.1,
			rootMargin = '-100px',
			tag = 'p',
			textAlign = 'center',
			onShuffleComplete,
			shuffleTimes = 1,
			animationMode = 'evenodd',
			loop = false,
			loopDelay = 0,
			stagger = 0.03,
			scrambleCharset = '',
			colorFrom,
			colorTo,
			triggerOnce = true,
			respectReducedMotion = true,
			triggerOnHover = true
		} = $$props;

		let el = void 0;
		let fontsLoaded = false;
		let ready = false;

		const scrollTriggerStart = $.derived(() => {
			const startPct = (1 - threshold) * 100;
			const mm = (/^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/).exec(rootMargin || '');
			const mv = mm ? parseFloat(mm[1]) : 0;
			const mu = mm ? mm[2] || 'px' : 'px';

			const sign = mv === 0
				? ''
				: mv < 0 ? `-=${Math.abs(mv)}${mu}` : `+=${mv}${mu}`;

			return `top ${startPct}%${sign}`;
		});

		$.element(
			$$renderer,
			/* noop */
			tag,
			() => {
				$$renderer.push(`${$.attr_class(`shuffle-parent ${ready ? 'is-ready' : ''} ${$.stringify(className)}`)}${$.attr_style(`text-align:${$.stringify(textAlign)};${$.stringify(style)}`)}`);
			},
			() => {
				$$renderer.push(`${$.escape(text)}`);
			}
		);
	});
}