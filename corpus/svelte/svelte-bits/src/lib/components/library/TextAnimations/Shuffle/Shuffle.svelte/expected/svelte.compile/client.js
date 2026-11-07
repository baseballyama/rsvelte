import 'svelte/internal/disclose-version';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';
import * as $ from 'svelte/internal/client';

gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

export default function Shuffle($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, ''),
		shuffleDirection = $.prop($$props, 'shuffleDirection', 3, 'right'),
		duration = $.prop($$props, 'duration', 3, 0.35),
		maxDelay = $.prop($$props, 'maxDelay', 3, 0),
		ease = $.prop($$props, 'ease', 3, 'power3.out'),
		threshold = $.prop($$props, 'threshold', 3, 0.1),
		rootMargin = $.prop($$props, 'rootMargin', 3, '-100px'),
		tag = $.prop($$props, 'tag', 3, 'p'),
		textAlign = $.prop($$props, 'textAlign', 3, 'center'),
		shuffleTimes = $.prop($$props, 'shuffleTimes', 3, 1),
		animationMode = $.prop($$props, 'animationMode', 3, 'evenodd'),
		loop = $.prop($$props, 'loop', 3, false),
		loopDelay = $.prop($$props, 'loopDelay', 3, 0),
		stagger = $.prop($$props, 'stagger', 3, 0.03),
		scrambleCharset = $.prop($$props, 'scrambleCharset', 3, ''),
		triggerOnce = $.prop($$props, 'triggerOnce', 3, true),
		respectReducedMotion = $.prop($$props, 'respectReducedMotion', 3, true),
		triggerOnHover = $.prop($$props, 'triggerOnHover', 3, true);

	let el = $.state(void 0);
	let fontsLoaded = $.state(false);
	let ready = $.state(false);

	const scrollTriggerStart = $.derived(() => {
		const startPct = (1 - threshold()) * 100;
		const mm = (/^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/).exec(rootMargin() || '');
		const mv = mm ? parseFloat(mm[1]) : 0;
		const mu = mm ? mm[2] || 'px' : 'px';

		const sign = mv === 0
			? ''
			: mv < 0 ? `-=${Math.abs(mv)}${mu}` : `+=${mv}${mu}`;

		return `top ${startPct}%${sign}`;
	});

	$.user_effect(() => {
		if (typeof document === 'undefined') return;

		if ('fonts' in document) {
			if (document.fonts.status === 'loaded') $.set(fontsLoaded, true); else document.fonts.ready.then(() => $.set(fontsLoaded, true));
		} else {
			$.set(fontsLoaded, true);
		}
	});

	$.user_effect(() => {
		if (!$.get(el) || !$$props.text || !$.get(fontsLoaded)) return;

		void duration();
		void maxDelay();
		void ease();
		void $.get(scrollTriggerStart);
		void shuffleDirection();
		void shuffleTimes();
		void animationMode();
		void loop();
		void loopDelay();
		void stagger();
		void scrambleCharset();
		void $$props.colorFrom;
		void $$props.colorTo;
		void triggerOnce();
		void respectReducedMotion();
		void triggerOnHover();

		const root = $.get(el);

		if (respectReducedMotion() && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			$.set(ready, true);
			$$props.onShuffleComplete?.();

			return;
		}

		let splitInstance = null;
		let wrappers = [];
		let tl = null;
		let playing = false;
		let hoverHandler = null;

		const removeHover = () => {
			if (hoverHandler) {
				root.removeEventListener('mouseenter', hoverHandler);
				hoverHandler = null;
			}
		};

		const teardown = () => {
			if (tl) {
				tl.kill();
				tl = null;
			}

			if (wrappers.length) {
				wrappers.forEach((wrap) => {
					const inner = wrap.firstElementChild;
					const orig = inner?.querySelector('[data-orig="1"]');

					if (orig && wrap.parentNode) wrap.parentNode.replaceChild(orig, wrap);
				});

				wrappers = [];
			}

			try {
				splitInstance?.revert();
			} catch {
				/* noop */
			}

			splitInstance = null;
			playing = false;
		};

		const build = () => {
			teardown();

			splitInstance = new GSAPSplitText(root, {
				type: 'chars',
				charsClass: 'shuffle-char',
				wordsClass: 'shuffle-word',
				linesClass: 'shuffle-line',
				smartWrap: true,
				reduceWhiteSpace: false
			});

			const chars = splitInstance.chars || [];

			wrappers = [];

			const rolls = Math.max(1, Math.floor(shuffleTimes()));
			const rand = (set) => set.charAt(Math.floor(Math.random() * set.length)) || '';

			chars.forEach((ch) => {
				const charEl = ch;
				const parent = charEl.parentElement;

				if (!parent) return;

				const w = charEl.getBoundingClientRect().width;
				const h = charEl.getBoundingClientRect().height;

				if (!w) return;

				const wrap = document.createElement('span');

				Object.assign(wrap.style, {
					display: 'inline-block',
					overflow: 'hidden',
					width: w + 'px',
					height: shuffleDirection() === 'up' || shuffleDirection() === 'down' ? h + 'px' : 'auto',
					verticalAlign: 'bottom'
				});

				const inner = document.createElement('span');

				Object.assign(inner.style, {
					display: 'inline-block',
					whiteSpace: shuffleDirection() === 'up' || shuffleDirection() === 'down' ? 'normal' : 'nowrap',
					willChange: 'transform'
				});

				parent.insertBefore(wrap, charEl);
				wrap.appendChild(inner);

				const firstOrig = charEl.cloneNode(true);

				Object.assign(firstOrig.style, {
					display: shuffleDirection() === 'up' || shuffleDirection() === 'down' ? 'block' : 'inline-block',
					width: w + 'px',
					textAlign: 'center'
				});

				charEl.setAttribute('data-orig', '1');

				Object.assign(charEl.style, {
					display: shuffleDirection() === 'up' || shuffleDirection() === 'down' ? 'block' : 'inline-block',
					width: w + 'px',
					textAlign: 'center'
				});

				inner.appendChild(firstOrig);

				for (let k = 0; k < rolls; k++) {
					const c = charEl.cloneNode(true);

					if (scrambleCharset()) c.textContent = rand(scrambleCharset());

					Object.assign(c.style, {
						display: shuffleDirection() === 'up' || shuffleDirection() === 'down' ? 'block' : 'inline-block',
						width: w + 'px',
						textAlign: 'center'
					});

					inner.appendChild(c);
				}

				inner.appendChild(charEl);

				const steps = rolls + 1;

				if (shuffleDirection() === 'right' || shuffleDirection() === 'down') {
					const firstCopy = inner.firstElementChild;
					const real = inner.lastElementChild;

					if (real) inner.insertBefore(real, inner.firstChild);
					if (firstCopy) inner.appendChild(firstCopy);
				}

				let startX = 0;
				let finalX = 0;
				let startY = 0;
				let finalY = 0;

				if (shuffleDirection() === 'right') {
					startX = -steps * w;
					finalX = 0;
				} else if (shuffleDirection() === 'left') {
					startX = 0;
					finalX = -steps * w;
				} else if (shuffleDirection() === 'down') {
					startY = -steps * h;
					finalY = 0;
				} else if (shuffleDirection() === 'up') {
					startY = 0;
					finalY = -steps * h;
				}

				if (shuffleDirection() === 'left' || shuffleDirection() === 'right') {
					gsap.set(inner, { x: startX, y: 0, force3D: true });
					inner.setAttribute('data-start-x', String(startX));
					inner.setAttribute('data-final-x', String(finalX));
				} else {
					gsap.set(inner, { x: 0, y: startY, force3D: true });
					inner.setAttribute('data-start-y', String(startY));
					inner.setAttribute('data-final-y', String(finalY));
				}

				if ($$props.colorFrom) inner.style.color = $$props.colorFrom;

				wrappers.push(wrap);
			});
		};

		const inners = () => wrappers.map((w) => w.firstElementChild).filter((node) => node instanceof HTMLElement);

		const randomizeScrambles = () => {
			if (!scrambleCharset()) return;

			wrappers.forEach((w) => {
				const strip = w.firstElementChild;

				if (!strip) return;

				const kids = Array.from(strip.children);

				for (let i = 1; i < kids.length - 1; i++) {
					kids[i].textContent = scrambleCharset().charAt(Math.floor(Math.random() * scrambleCharset().length));
				}
			});
		};

		const cleanupToStill = () => {
			wrappers.forEach((w) => {
				const strip = w.firstElementChild;

				if (!strip) return;

				const real = strip.querySelector('[data-orig="1"]');

				if (!real) return;

				strip.replaceChildren(real);
				strip.style.transform = 'none';
				strip.style.willChange = 'auto';
			});
		};

		const play = () => {
			const strips = inners();

			if (!strips.length) return;

			playing = true;

			const isVertical = shuffleDirection() === 'up' || shuffleDirection() === 'down';

			tl = gsap.timeline({
				smoothChildTiming: true,
				repeat: loop() ? -1 : 0,
				repeatDelay: loop() ? loopDelay() : 0,
				onRepeat: () => {
					if (scrambleCharset()) randomizeScrambles();

					if (isVertical) {
						gsap.set(strips, {
							y: (_, t) => parseFloat(t.getAttribute('data-start-y') || '0')
						});
					} else {
						gsap.set(strips, {
							x: (_, t) => parseFloat(t.getAttribute('data-start-x') || '0')
						});
					}

					$$props.onShuffleComplete?.();
				},

				onComplete: () => {
					playing = false;

					if (!loop()) {
						cleanupToStill();

						if ($$props.colorTo) gsap.set(strips, { color: $$props.colorTo });

						$$props.onShuffleComplete?.();
						armHover();
					}
				}
			});

			const addTween = (targets, at) => {
				const vars = {
					duration: duration(),
					ease: ease(),
					force3D: true,
					stagger: animationMode() === 'evenodd' ? stagger() : 0
				};

				if (isVertical) {
					vars.y = (_, t) => parseFloat(t.getAttribute('data-final-y') || '0');
				} else {
					vars.x = (_, t) => parseFloat(t.getAttribute('data-final-x') || '0');
				}

				tl.to(targets, vars, at);

				if ($$props.colorFrom && $$props.colorTo) {
					tl.to(targets, { color: $$props.colorTo, duration: duration(), ease: ease() }, at);
				}
			};

			if (animationMode() === 'evenodd') {
				const odd = strips.filter((_, i) => i % 2 === 1);
				const even = strips.filter((_, i) => i % 2 === 0);
				const oddTotal = duration() + Math.max(0, odd.length - 1) * stagger();
				const evenStart = odd.length ? oddTotal * 0.7 : 0;

				if (odd.length) addTween(odd, 0);
				if (even.length) addTween(even, evenStart);
			} else {
				strips.forEach((strip) => {
					const d = Math.random() * maxDelay();
					const vars = { duration: duration(), ease: ease(), force3D: true };

					if (isVertical) {
						vars.y = parseFloat(strip.getAttribute('data-final-y') || '0');
					} else {
						vars.x = parseFloat(strip.getAttribute('data-final-x') || '0');
					}

					tl.to(strip, vars, d);

					if ($$props.colorFrom && $$props.colorTo) tl.fromTo(strip, { color: $$props.colorFrom }, { color: $$props.colorTo, duration: duration(), ease: ease() }, d);
				});
			}
		};

		const armHover = () => {
			if (!triggerOnHover() || !root) return;

			removeHover();

			const handler = () => {
				if (playing) return;

				build();

				if (scrambleCharset()) randomizeScrambles();

				play();
			};

			hoverHandler = handler;
			root.addEventListener('mouseenter', handler);
		};

		const create = () => {
			build();

			if (scrambleCharset()) randomizeScrambles();

			play();
			armHover();
			$.set(ready, true);
		};

		const st = ScrollTrigger.create({
			trigger: root,
			start: $.get(scrollTriggerStart),
			once: triggerOnce(),
			onEnter: create
		});

		return () => {
			st.kill();
			removeHover();
			teardown();
			$.set(ready, false);
		};
	});

	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	$.element(node_1, tag, false, ($$element, $$anchor) => {
		$.bind_this($$element, ($$value) => $.set(el, $$value, true), () => $.get(el));

		$.attribute_effect($$element, () => ({
			class: `shuffle-parent ${$.get(ready) ? 'is-ready' : ''} ${className() ?? ''}`,
			style: `text-align:${textAlign() ?? ''};${style() ?? ''}`
		}));

		var text_1 = $.text();

		$.template_effect(() => $.set_text(text_1, $$props.text));
		$.append($$anchor, text_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}