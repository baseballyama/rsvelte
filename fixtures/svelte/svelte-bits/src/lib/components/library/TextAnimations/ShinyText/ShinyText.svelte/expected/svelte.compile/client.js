import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span role="presentation"> </span>`);

export default function ShinyText($$anchor, $$props) {
	$.push($$props, true);

	let disabled = $.prop($$props, 'disabled', 3, false),
		speed = $.prop($$props, 'speed', 3, 2),
		className = $.prop($$props, 'class', 3, ''),
		color = $.prop($$props, 'color', 3, '#b5b5b5'),
		shineColor = $.prop($$props, 'shineColor', 3, '#ffffff'),
		spread = $.prop($$props, 'spread', 3, 120),
		yoyo = $.prop($$props, 'yoyo', 3, false),
		pauseOnHover = $.prop($$props, 'pauseOnHover', 3, false),
		direction = $.prop($$props, 'direction', 3, 'left'),
		delay = $.prop($$props, 'delay', 3, 0);

	let progress = $.state($.proxy(direction() === 'left' ? 0 : 100));
	let isPaused = $.state(false);

	$.user_effect(() => {
		// reset on direction change
		void direction();

		$.set(progress, direction() === 'left' ? 0 : 100, true);
	});

	$.user_effect(() => {
		if (disabled()) return;

		const dir = direction() === 'left' ? 1 : -1;
		const animationDuration = speed() * 1000;
		const delayDuration = delay() * 1000;
		let elapsed = 0;
		let last = null;
		let raf = 0;

		const tick = (time) => {
			if ($.get(isPaused)) {
				last = null;
				raf = requestAnimationFrame(tick);

				return;
			}

			if (last === null) {
				last = time;
				raf = requestAnimationFrame(tick);

				return;
			}

			elapsed += time - last;
			last = time;

			if (yoyo()) {
				const cycleDuration = animationDuration + delayDuration;
				const fullCycle = cycleDuration * 2;
				const ct = elapsed % fullCycle;

				if (ct < animationDuration) {
					const p = ct / animationDuration * 100;

					$.set(progress, dir === 1 ? p : 100 - p, true);
				} else if (ct < cycleDuration) {
					$.set(progress, dir === 1 ? 100 : 0, true);
				} else if (ct < cycleDuration + animationDuration) {
					const rt = ct - cycleDuration;
					const p = 100 - rt / animationDuration * 100;

					$.set(progress, dir === 1 ? p : 100 - p, true);
				} else {
					$.set(progress, dir === 1 ? 0 : 100, true);
				}
			} else {
				const cycleDuration = animationDuration + delayDuration;
				const ct = elapsed % cycleDuration;

				if (ct < animationDuration) {
					const p = ct / animationDuration * 100;

					$.set(progress, dir === 1 ? p : 100 - p, true);
				} else {
					$.set(progress, dir === 1 ? 100 : 0, true);
				}
			}

			raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);

		return () => cancelAnimationFrame(raf);
	});

	const backgroundImage = $.derived(() => `linear-gradient(${spread()}deg, ${color()} 0%, ${color()} 35%, ${shineColor()} 50%, ${color()} 65%, ${color()} 100%)`);
	const backgroundPosition = $.derived(() => `${150 - $.get(progress) * 2}% center`);
	var span = root();
	let styles;
	var text_1 = $.only_child(span, true);

	$.template_effect(() => {
		$.set_class(span, 1, `inline-block ${className() ?? ''}`);

		styles = $.set_style(span, '', styles, {
			'background-image': $.get(backgroundImage),
			'background-size': '200% auto',
			'background-position': $.get(backgroundPosition),
			'-webkit-background-clip': 'text',
			'background-clip': 'text',
			'-webkit-text-fill-color': 'transparent'
		});

		$.set_text(text_1, $$props.text);
	});

	$.event('mouseenter', span, () => pauseOnHover() && $.set(isPaused, true));
	$.event('mouseleave', span, () => pauseOnHover() && $.set(isPaused, false));
	$.append($$anchor, span);
	$.pop();
}