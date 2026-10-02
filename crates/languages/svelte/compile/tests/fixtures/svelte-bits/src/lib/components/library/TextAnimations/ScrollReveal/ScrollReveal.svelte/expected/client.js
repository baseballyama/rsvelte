import 'svelte/internal/disclose-version';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as $ from 'svelte/internal/client';

gsap.registerPlugin(ScrollTrigger);

var root = $.from_html(`<span class="scroll-reveal-word svelte-1d0scom"> </span>`);
var root_1 = $.from_html(`<h2><p></p></h2>`);

export default function ScrollReveal($$anchor, $$props) {
	$.push($$props, true);

	let scrollContainer = $.prop($$props, 'scrollContainer', 3, null),
		enableBlur = $.prop($$props, 'enableBlur', 3, true),
		baseOpacity = $.prop($$props, 'baseOpacity', 3, 0.1),
		baseRotation = $.prop($$props, 'baseRotation', 3, 3),
		blurStrength = $.prop($$props, 'blurStrength', 3, 4),
		containerClassName = $.prop($$props, 'containerClassName', 3, ''),
		textClassName = $.prop($$props, 'textClassName', 3, ''),
		rotationEnd = $.prop($$props, 'rotationEnd', 3, 'bottom bottom'),
		wordAnimationEnd = $.prop($$props, 'wordAnimationEnd', 3, 'bottom bottom');

	let containerEl = $.state(void 0);
	const splitParts = $.derived(() => $$props.text.split(/(\s+)/));

	$.user_effect(() => {
		const el = $.get(containerEl);

		if (!el) return;

		void enableBlur();
		void baseOpacity();
		void baseRotation();
		void blurStrength();
		void rotationEnd();
		void wordAnimationEnd();
		void scrollContainer();
		void $.get(splitParts);

		const scroller = scrollContainer() ?? window;
		const triggers = [];

		const rotationTween = gsap.fromTo(el, { transformOrigin: '0% 50%', rotate: baseRotation() }, {
			ease: 'none',
			rotate: 0,
			scrollTrigger: {
				trigger: el,
				scroller,
				start: 'top bottom',
				end: rotationEnd(),
				scrub: true
			}
		});

		if (rotationTween.scrollTrigger) triggers.push(rotationTween.scrollTrigger);

		const wordElements = el.querySelectorAll('.scroll-reveal-word');

		const opacityTween = gsap.fromTo(wordElements, { opacity: baseOpacity(), willChange: 'opacity' }, {
			ease: 'none',
			opacity: 1,
			stagger: 0.05,
			scrollTrigger: {
				trigger: el,
				scroller,
				start: 'top bottom-=20%',
				end: wordAnimationEnd(),
				scrub: true
			}
		});

		if (opacityTween.scrollTrigger) triggers.push(opacityTween.scrollTrigger);

		if (enableBlur()) {
			const blurTween = gsap.fromTo(wordElements, { filter: `blur(${blurStrength()}px)` }, {
				ease: 'none',
				filter: 'blur(0px)',
				stagger: 0.05,
				scrollTrigger: {
					trigger: el,
					scroller,
					start: 'top bottom-=20%',
					end: wordAnimationEnd(),
					scrub: true
				}
			});

			if (blurTween.scrollTrigger) triggers.push(blurTween.scrollTrigger);
		}

		return () => {
			triggers.forEach((t) => t.kill());
		};
	});

	var h2 = root_1();
	var p = $.child(h2);

	$.each(p, 21, () => $.get(splitParts), $.index, ($$anchor, part) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var text_1 = $.text();

				$.template_effect(() => $.set_text(text_1, $.get(part)));
				$.append($$anchor, text_1);
			};

			var d = $.derived(() => (/^\s+$/).test($.get(part)));

			var alternate = ($$anchor) => {
				var span = root();
				var text_2 = $.only_child(span, true);

				$.template_effect(() => $.set_text(text_2, $.get(part)));
				$.append($$anchor, span);
			};

			$.if(node, ($$render) => {
				if ($.get(d)) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment);
	});

	$.reset(p);
	$.reset(h2);
	$.bind_this(h2, ($$value) => $.set(containerEl, $$value), () => $.get(containerEl));

	$.template_effect(() => {
		$.set_class(h2, 1, `scroll-reveal ${containerClassName() ?? ''}`, 'svelte-1d0scom');
		$.set_class(p, 1, `scroll-reveal-text ${textClassName() ?? ''}`, 'svelte-1d0scom');
	});

	$.append($$anchor, h2);
	$.pop();
}