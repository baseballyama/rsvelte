import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { gsap } from 'gsap';

var root = $.from_html(`<div class="fixed top-0 left-0 w-0 h-0 pointer-events-none z-[9999]" style="will-change:transform;"><div class="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" style="will-change:transform;"></div> <div class="target-cursor-corner absolute top-1/2 left-1/2 w-3 h-3 border-[3px] border-white -translate-x-[150%] -translate-y-[150%] border-r-0 border-b-0" style="will-change:transform;"></div> <div class="target-cursor-corner absolute top-1/2 left-1/2 w-3 h-3 border-[3px] border-white translate-x-1/2 -translate-y-[150%] border-l-0 border-b-0" style="will-change:transform;"></div> <div class="target-cursor-corner absolute top-1/2 left-1/2 w-3 h-3 border-[3px] border-white translate-x-1/2 translate-y-1/2 border-l-0 border-t-0" style="will-change:transform;"></div> <div class="target-cursor-corner absolute top-1/2 left-1/2 w-3 h-3 border-[3px] border-white -translate-x-[150%] translate-y-1/2 border-r-0 border-t-0" style="will-change:transform;"></div></div>`);

export default function TargetCursor($$anchor, $$props) {
	$.push($$props, true);

	let targetSelector = $.prop($$props, 'targetSelector', 3, '.cursor-target'),
		spinDuration = $.prop($$props, 'spinDuration', 3, 2),
		hideDefaultCursor = $.prop($$props, 'hideDefaultCursor', 3, true),
		hoverDuration = $.prop($$props, 'hoverDuration', 3, 0.2),
		parallaxOn = $.prop($$props, 'parallaxOn', 3, true);

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

	$.user_effect(() => {
		if (isMobile || !cursor) return;

		const corners = cursor.querySelectorAll('.target-cursor-corner');
		const constants = { borderWidth: 3, cornerSize: 12 };
		let activeTarget = null;
		let currentLeaveHandler = null;
		let resumeTimeout = null;
		let targetCornerPositions = null;
		const activeStrength = { current: 0 };
		let tickerFn = null;
		let spinTl;
		const originalCursor = document.body.style.cursor;

		if (hideDefaultCursor()) document.body.style.cursor = 'none';

		const cleanupTarget = (target) => {
			if (currentLeaveHandler) target.removeEventListener('mouseleave', currentLeaveHandler);

			currentLeaveHandler = null;
		};

		gsap.set(cursor, {
			xPercent: -50,
			yPercent: -50,
			x: window.innerWidth / 2,
			y: window.innerHeight / 2
		});

		const createSpin = () => {
			spinTl?.kill();
			spinTl = gsap.timeline({ repeat: -1 }).to(cursor, { rotation: '+=360', duration: spinDuration(), ease: 'none' });
		};

		createSpin();

		tickerFn = () => {
			if (!targetCornerPositions || !cursor) return;

			const strength = activeStrength.current;

			if (strength === 0) return;

			const cx = gsap.getProperty(cursor, 'x');
			const cy = gsap.getProperty(cursor, 'y');

			Array.from(corners).forEach((corner, i) => {
				const curX = gsap.getProperty(corner, 'x');
				const curY = gsap.getProperty(corner, 'y');
				const tx = targetCornerPositions[i].x - cx;
				const ty = targetCornerPositions[i].y - cy;
				const finalX = curX + (tx - curX) * strength;
				const finalY = curY + (ty - curY) * strength;
				const dur = strength >= 0.99 ? parallaxOn() ? 0.2 : 0 : 0.05;

				gsap.to(corner, {
					x: finalX,
					y: finalY,
					duration: dur,
					ease: dur === 0 ? 'none' : 'power1.out',
					overwrite: 'auto'
				});
			});
		};

		const moveHandler = (e) => {
			gsap.to(cursor, {
				x: e.clientX,
				y: e.clientY,
				duration: 0.1,
				ease: 'power3.out'
			});
		};

		window.addEventListener('mousemove', moveHandler);

		const scrollHandler = () => {
			if (!activeTarget || !cursor) return;

			const mx = gsap.getProperty(cursor, 'x');
			const my = gsap.getProperty(cursor, 'y');
			const under = document.elementFromPoint(mx, my);
			const still = under && (under === activeTarget || under.closest(targetSelector()) === activeTarget);

			if (!still) currentLeaveHandler?.();
		};

		window.addEventListener('scroll', scrollHandler, { passive: true });

		const mouseDown = () => {
			if (!dot) return;

			gsap.to(dot, { scale: 0.7, duration: 0.3 });
			gsap.to(cursor, { scale: 0.9, duration: 0.2 });
		};

		const mouseUp = () => {
			if (!dot) return;

			gsap.to(dot, { scale: 1, duration: 0.3 });
			gsap.to(cursor, { scale: 1, duration: 0.2 });
		};

		window.addEventListener('mousedown', mouseDown);
		window.addEventListener('mouseup', mouseUp);

		const enterHandler = (ev) => {
			const direct = ev.target;
			let target = null;
			let cur = direct;

			while (cur && cur !== document.body) {
				if (cur.matches(targetSelector())) {
					target = cur;

					break;
				}

				cur = cur.parentElement;
			}

			if (!target || !cursor) return;
			if (activeTarget === target) return;
			if (activeTarget) cleanupTarget(activeTarget);

			if (resumeTimeout) {
				clearTimeout(resumeTimeout);
				resumeTimeout = null;
			}

			activeTarget = target;
			Array.from(corners).forEach((c) => gsap.killTweensOf(c));
			gsap.killTweensOf(cursor, 'rotation');
			spinTl?.pause();
			gsap.set(cursor, { rotation: 0 });

			const rect = target.getBoundingClientRect();
			const { borderWidth, cornerSize } = constants;
			const cx = gsap.getProperty(cursor, 'x');
			const cy = gsap.getProperty(cursor, 'y');

			targetCornerPositions = [
				{ x: rect.left - borderWidth, y: rect.top - borderWidth },
				{
					x: rect.right + borderWidth - cornerSize,
					y: rect.top - borderWidth
				},

				{
					x: rect.right + borderWidth - cornerSize,
					y: rect.bottom + borderWidth - cornerSize
				},

				{
					x: rect.left - borderWidth,
					y: rect.bottom + borderWidth - cornerSize
				}
			];

			gsap.ticker.add(tickerFn);
			gsap.to(activeStrength, { current: 1, duration: hoverDuration(), ease: 'power2.out' });

			Array.from(corners).forEach((corner, i) => {
				gsap.to(corner, {
					x: targetCornerPositions[i].x - cx,
					y: targetCornerPositions[i].y - cy,
					duration: 0.2,
					ease: 'power2.out'
				});
			});

			const leaveHandler = () => {
				gsap.ticker.remove(tickerFn);
				targetCornerPositions = null;
				gsap.set(activeStrength, { current: 0, overwrite: true });
				activeTarget = null;

				const cs = Array.from(corners);

				gsap.killTweensOf(cs);

				const { cornerSize } = constants;

				const positions = [
					{ x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
					{ x: cornerSize * 0.5, y: -cornerSize * 1.5 },
					{ x: cornerSize * 0.5, y: cornerSize * 0.5 },
					{ x: -cornerSize * 1.5, y: cornerSize * 0.5 }
				];

				const tl = gsap.timeline();

				cs.forEach((c, i) => {
					tl.to(
						c,
						{
							x: positions[i].x,
							y: positions[i].y,
							duration: 0.3,
							ease: 'power3.out'
						},
						0
					);
				});

				resumeTimeout = setTimeout(
					() => {
						if (!activeTarget && cursor && spinTl) {
							const r = gsap.getProperty(cursor, 'rotation');
							const norm = r % 360;

							spinTl.kill();
							spinTl = gsap.timeline({ repeat: -1 }).to(cursor, { rotation: '+=360', duration: spinDuration(), ease: 'none' });

							gsap.to(cursor, {
								rotation: norm + 360,
								duration: spinDuration() * (1 - norm / 360),
								ease: 'none',
								onComplete: () => spinTl?.restart()
							});
						}

						resumeTimeout = null;
					},
					50
				);

				cleanupTarget(target);
			};

			currentLeaveHandler = leaveHandler;
			target.addEventListener('mouseleave', leaveHandler);
		};

		window.addEventListener('mouseover', enterHandler);

		return () => {
			if (tickerFn) gsap.ticker.remove(tickerFn);

			window.removeEventListener('mousemove', moveHandler);
			window.removeEventListener('mouseover', enterHandler);
			window.removeEventListener('scroll', scrollHandler);
			window.removeEventListener('mousedown', mouseDown);
			window.removeEventListener('mouseup', mouseUp);

			if (activeTarget) cleanupTarget(activeTarget);

			spinTl?.kill();
			document.body.style.cursor = originalCursor;
		};
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var div_1 = $.child(div);

			$.bind_this(div_1, ($$value) => dot = $$value, () => dot);
			$.next(8);
			$.reset(div);
			$.bind_this(div, ($$value) => cursor = $$value, () => cursor);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (!isMobile) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}