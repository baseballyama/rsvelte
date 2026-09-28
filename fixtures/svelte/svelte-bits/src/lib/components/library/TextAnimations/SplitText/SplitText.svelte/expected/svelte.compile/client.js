import 'svelte/internal/disclose-version';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';
import * as $ from 'svelte/internal/client';

gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

export default function SplitText($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, ''),
		delay = $.prop($$props, 'delay', 3, 50),
		duration = $.prop($$props, 'duration', 3, 1.25),
		ease = $.prop($$props, 'ease', 3, 'power3.out'),
		splitType = $.prop($$props, 'splitType', 3, 'chars'),
		from = $.prop($$props, 'from', 19, () => ({ opacity: 0, y: 40 })),
		to = $.prop($$props, 'to', 19, () => ({ opacity: 1, y: 0 })),
		threshold = $.prop($$props, 'threshold', 3, 0.1),
		rootMargin = $.prop($$props, 'rootMargin', 3, '-100px'),
		tag = $.prop($$props, 'tag', 3, 'p'),
		textAlign = $.prop($$props, 'textAlign', 3, 'center');

	let el;
	let fontsLoaded = $.state(false);
	let animationCompleted = false;
	let onCompleteRef = $.derived(() => $$props.onLetterAnimationComplete);

	$.user_effect(() => {
		if (document.fonts.status === 'loaded') {
			$.set(fontsLoaded, true);
		} else {
			document.fonts.ready.then(() => {
				$.set(fontsLoaded, true);
			});
		}
	});

	$.user_effect(() => {
		if (!el || !$$props.text || !$.get(fontsLoaded)) return;
		if (animationCompleted) return;

		if (el._rbsplitInstance) {
			try {
				el._rbsplitInstance.revert();
			} catch {
				// GSAP may already have reverted during teardown.
			}

			el._rbsplitInstance = undefined;
		}

		const startPct = (1 - threshold()) * 100;
		const marginMatch = (/^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/).exec(rootMargin());
		const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
		const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';

		const sign = marginValue === 0
			? ''
			: marginValue < 0
				? `-=${Math.abs(marginValue)}${marginUnit}`
				: `+=${marginValue}${marginUnit}`;

		const start = `top ${startPct}%${sign}`;
		let targets = [];

		const assignTargets = (self) => {
			if (splitType().includes('chars') && self.chars?.length) targets = self.chars;
			if (!targets.length && splitType().includes('words') && self.words.length) targets = self.words;
			if (!targets.length && splitType().includes('lines') && self.lines.length) targets = self.lines;
			if (!targets.length) targets = self.chars || self.words || self.lines;
		};

		const splitInstance = new GSAPSplitText(el, {
			type: splitType(),
			smartWrap: true,
			autoSplit: splitType() === 'lines',
			linesClass: 'split-line',
			wordsClass: 'split-word',
			charsClass: 'split-char',
			reduceWhiteSpace: false,
			onSplit: (self) => {
				assignTargets(self);

				return gsap.fromTo(targets, { ...from() }, {
					...to(),
					duration: duration(),
					ease: ease(),
					stagger: delay() / 1000,
					scrollTrigger: {
						trigger: el,
						start,
						once: true,
						fastScrollEnd: true,
						anticipatePin: 0.4
					},

					onComplete: () => {
						animationCompleted = true;
						$.get(onCompleteRef)?.();
					},
					willChange: 'transform, opacity',
					force3D: true
				});
			}
		});

		el._rbsplitInstance = splitInstance;

		return () => {
			ScrollTrigger.getAll().forEach((st) => {
				if (st.trigger === el) st.kill();
			});

			try {
				splitInstance.revert();
			} catch {
				// GSAP may already have reverted during teardown.
			}

			el._rbsplitInstance = undefined;
		};
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, tag, false, ($$element, $$anchor) => {
		$.bind_this($$element, ($$value) => el = $$value, () => el);

		$.attribute_effect($$element, () => ({
			class: `split-parent overflow-hidden inline-block whitespace-normal ${className() ?? ''}`,
			style: '',
			[$.STYLE]: {
				'text-align': textAlign(),
				'word-wrap': 'break-word',
				'will-change': 'transform, opacity'
			}
		}));

		var text_1 = $.text();

		$.template_effect(() => $.set_text(text_1, $$props.text));
		$.append($$anchor, text_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}