import * as $ from 'svelte/internal/server';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollReveal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			text,
			scrollContainer = null,
			enableBlur = true,
			baseOpacity = 0.1,
			baseRotation = 3,
			blurStrength = 4,
			containerClassName = '',
			textClassName = '',
			rotationEnd = 'bottom bottom',
			wordAnimationEnd = 'bottom bottom'
		} = $$props;

		let containerEl = void 0;
		const splitParts = $.derived(() => text.split(/(\s+)/));

		$$renderer.push(`<h2${$.attr_class(`scroll-reveal ${$.stringify(containerClassName)}`, 'svelte-1d0scom')}><p${$.attr_class(`scroll-reveal-text ${$.stringify(textClassName)}`, 'svelte-1d0scom')}><!--[-->`);

		const each_array = $.ensure_array_like(splitParts());

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let part = each_array[i];

			if ((/^\s+$/).test(part)) {
				$$renderer.push(`<!--[0-->${$.escape(part)}`);
			} else {
				$$renderer.push(`<!--[-1--><span class="scroll-reveal-word svelte-1d0scom">${$.escape(part)}</span>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></p></h2>`);
	});
}