import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { animate } from 'motion';

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<p></p>`);

export default function BlurText($$anchor, $$props) {
	$.push($$props, true);

	let text = $.prop($$props, 'text', 3, ''),
		delay = $.prop($$props, 'delay', 3, 200),
		className = $.prop($$props, 'class', 3, ''),
		animateBy = $.prop($$props, 'animateBy', 3, 'words'),
		direction = $.prop($$props, 'direction', 3, 'top'),
		threshold = $.prop($$props, 'threshold', 3, 0.1),
		rootMargin = $.prop($$props, 'rootMargin', 3, '0px'),
		easing = $.prop($$props, 'easing', 3, (t) => t),
		stepDuration = $.prop($$props, 'stepDuration', 3, 0.35);

	const elements = $.derived(() => animateBy() === 'words' ? text().split(' ') : text().split(''));
	let inView = $.state(false);
	let containerEl = $.state(void 0);
	let spanEls = $.proxy([]);

	$.user_effect(() => {
		if (!$.get(containerEl)) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					$.set(inView, true);

					if ($.get(containerEl)) observer.unobserve($.get(containerEl));
				}
			},
			{ threshold: threshold(), rootMargin: rootMargin() }
		);

		observer.observe($.get(containerEl));

		return () => observer.disconnect();
	});

	const defaultFrom = $.derived(() => direction() === 'top'
		? { filter: 'blur(10px)', opacity: 0, y: -50 }
		: { filter: 'blur(10px)', opacity: 0, y: 50 });

	const defaultTo = $.derived(() => [
		{
			filter: 'blur(5px)',
			opacity: 0.5,
			y: direction() === 'top' ? 5 : -5
		},
		{ filter: 'blur(0px)', opacity: 1, y: 0 }
	]);

	const fromSnapshot = $.derived(() => $$props.animationFrom ?? $.get(defaultFrom));
	const toSnapshots = $.derived(() => $$props.animationTo ?? $.get(defaultTo));

	function buildKeyframes(from, steps) {
		const keys = new Set([
			...Object.keys(from),
			...steps.flatMap((s) => Object.keys(s))
		]);

		const out = {};

		keys.forEach((k) => {
			out[k] = [from[k], ...steps.map((s) => s[k])];
		});

		return out;
	}

	function applyInitial(el, snap) {
		const props = {};

		for (const [k, v] of Object.entries(snap)) {
			if (k === 'y') {
				props.transform = `translateY(${typeof v === 'number' ? v + 'px' : v})`;
			} else if (k === 'x') {
				props.transform = `${props.transform ?? ''} translateX(${typeof v === 'number' ? v + 'px' : v})`.trim();
			} else if (k === 'filter') {
				props.filter = String(v);
			} else if (k === 'opacity') {
				props.opacity = String(v);
			} else {
				el.style[k] = String(v);
			}
		}

		if (props.transform) el.style.transform = props.transform;
		if (props.filter !== undefined) el.style.filter = props.filter;
		if (props.opacity !== undefined) el.style.opacity = props.opacity;
	}

	// Set initial styles immediately on mount
	$.user_effect(() => {
		// re-run when snapshots change
		void $.get(fromSnapshot);

		spanEls.forEach((el) => el && applyInitial(el, $.get(fromSnapshot)));
	});

	$.user_effect(() => {
		if (!$.get(inView)) return;

		const stepCount = $.get(toSnapshots).length + 1;
		const totalDuration = stepDuration() * (stepCount - 1);
		const times = Array.from({ length: stepCount }, (_, i) => stepCount === 1 ? 0 : i / (stepCount - 1));
		const kf = buildKeyframes($.get(fromSnapshot), $.get(toSnapshots));

		// Build per-property keyframe arrays with `y` mapped to translateY transform
		const animations = [];

		spanEls.forEach((el, index) => {
			if (!el) return;

			const targetKeyframes = {};

			for (const [k, frames] of Object.entries(kf)) {
				if (k === 'y') {
					targetKeyframes.transform = frames.map((v) => `translateY(${typeof v === 'number' ? v + 'px' : v})`);
				} else {
					targetKeyframes[k] = frames;
				}
			}

			const controls = animate(el, targetKeyframes, {
				duration: totalDuration,
				times,
				delay: index * delay() / 1000,
				ease: easing()
			});

			if (index === $.get(elements).length - 1 && $$props.onAnimationComplete) {
				const finished = controls.finished;

				if (finished && typeof finished.then === 'function') {
					finished.then(() => $$props.onAnimationComplete?.()).catch(() => {});
				}
			}

			animations.push({
				stop: () => {
					const c = controls;

					c.stop?.();
					c.cancel?.();
				}
			});
		});

		return () => {
			animations.forEach((a) => a.stop());
		};
	});

	var p = root_1();

	$.each(p, 21, () => $.get(elements), $.index, ($$anchor, segment, index) => {
		var span = root();

		$.set_style(span, '', {}, {
			display: 'inline-block',
			'will-change': 'transform, filter, opacity'
		});

		var text_1 = $.only_child(span);

		$.bind_this(span, ($$value, index) => spanEls[index] = $$value, (index) => spanEls?.[index], () => [index]);
		$.template_effect(() => $.set_text(text_1, `${($.get(segment) === ' ' ? '\u00A0' : $.get(segment)) ?? ''}${animateBy() === 'words' && index < $.get(elements).length - 1 ? '\u00A0' : ''}`));
		$.append($$anchor, span);
	});

	$.reset(p);
	$.bind_this(p, ($$value) => $.set(containerEl, $$value), () => $.get(containerEl));
	$.template_effect(() => $.set_class(p, 1, `blur-text ${className() ?? ''} flex flex-wrap`));
	$.append($$anchor, p);
	$.pop();
}