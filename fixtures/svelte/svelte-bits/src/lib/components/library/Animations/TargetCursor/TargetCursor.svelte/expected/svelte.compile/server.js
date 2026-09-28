import * as $ from 'svelte/internal/server';
import { gsap } from 'gsap';

export default function TargetCursor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			targetSelector = '.cursor-target',
			spinDuration = 2,
			hideDefaultCursor = true,
			hoverDuration = 0.2,
			parallaxOn = true
		} = $$props;

		let cursor;
		let dot;

		const isMobile = (() => {
			if (typeof window === 'undefined') return false;

			const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
			const small = window.innerWidth <= 768;
			const ua = navigator.userAgent || navigator.vendor || window.opera || '';
			const re = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

			return hasTouch && small || re.test(ua.toLowerCase());
		})();

		if (!isMobile) {
			$$renderer.push(`<!--[0--><div class="fixed top-0 left-0 w-0 h-0 pointer-events-none z-[9999]" style="will-change:transform;"><div class="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" style="will-change:transform;"></div> <div class="target-cursor-corner absolute top-1/2 left-1/2 w-3 h-3 border-[3px] border-white -translate-x-[150%] -translate-y-[150%] border-r-0 border-b-0" style="will-change:transform;"></div> <div class="target-cursor-corner absolute top-1/2 left-1/2 w-3 h-3 border-[3px] border-white translate-x-1/2 -translate-y-[150%] border-l-0 border-b-0" style="will-change:transform;"></div> <div class="target-cursor-corner absolute top-1/2 left-1/2 w-3 h-3 border-[3px] border-white translate-x-1/2 translate-y-1/2 border-l-0 border-t-0" style="will-change:transform;"></div> <div class="target-cursor-corner absolute top-1/2 left-1/2 w-3 h-3 border-[3px] border-white -translate-x-[150%] translate-y-1/2 border-r-0 border-t-0" style="will-change:transform;"></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}