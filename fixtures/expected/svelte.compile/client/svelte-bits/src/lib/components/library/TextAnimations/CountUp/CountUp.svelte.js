import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { animate } from 'motion';

var root = $.from_html(`<span></span>`);

export default function CountUp($$anchor, $$props) {
	$.push($$props, true);

	let from = $.prop($$props, 'from', 3, 0),
		direction = $.prop($$props, 'direction', 3, 'up'),
		delay = $.prop($$props, 'delay', 3, 0),
		duration = $.prop($$props, 'duration', 3, 2),
		className = $.prop($$props, 'class', 3, ''),
		startWhen = $.prop($$props, 'startWhen', 3, true),
		separator = $.prop($$props, 'separator', 3, '');

	let spanEl = $.state(void 0);
	let inView = $.state(false);

	function getDecimalPlaces(num) {
		const str = num.toString();

		if (str.includes('.')) {
			const decimals = str.split('.')[1];

			if (parseInt(decimals) !== 0) return decimals.length;
		}

		return 0;
	}

	const maxDecimals = $.derived(() => Math.max(getDecimalPlaces(from()), getDecimalPlaces($$props.to)));

	function formatValue(latest, decimals, sep) {
		const hasDecimals = decimals > 0;

		const options = {
			useGrouping: !!sep,
			minimumFractionDigits: hasDecimals ? decimals : 0,
			maximumFractionDigits: hasDecimals ? decimals : 0
		};

		const formatted = Intl.NumberFormat('en-US', options).format(latest);

		return sep ? formatted.replace(/,/g, sep) : formatted;
	}

	$.user_effect(() => {
		if ($.get(spanEl)) {
			$.get(spanEl).textContent = formatValue(direction() === 'down' ? $$props.to : from(), $.get(maxDecimals), separator());
		}
	});

	$.user_effect(() => {
		if (!$.get(spanEl)) return;

		const el = $.get(spanEl);

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					$.set(inView, true);
					observer.unobserve(el);
				}
			},
			{ threshold: 0 }
		);

		observer.observe(el);

		return () => observer.disconnect();
	});

	$.user_effect(() => {
		if (!$.get(inView) || !startWhen() || !$.get(spanEl)) return;

		const el = $.get(spanEl);
		const decimals = $.get(maxDecimals);
		const sep = separator();
		const damping = 20 + 40 * (1 / duration());
		const stiffness = 100 * (1 / duration());
		const startValue = direction() === 'down' ? $$props.to : from();
		const endValue = direction() === 'down' ? from() : $$props.to;

		$$props.onStart?.();

		let stopFn;

		const startTimeout = setTimeout(
			() => {
				const controls = animate(startValue, endValue, {
					type: 'spring',
					damping,
					stiffness,
					onUpdate: (latest) => {
						if (el) el.textContent = formatValue(latest, decimals, sep);
					}
				});

				stopFn = () => controls.stop();
			},
			delay() * 1000
		);

		const endTimeout = setTimeout(
			() => {
				$$props.onEnd?.();
			},
			(delay() + duration()) * 1000
		);

		return () => {
			clearTimeout(startTimeout);
			clearTimeout(endTimeout);
			stopFn?.();
		};
	});

	var span = root();

	$.bind_this(span, ($$value) => $.set(spanEl, $$value), () => $.get(spanEl));
	$.template_effect(() => $.set_class(span, 1, $.clsx(className())));
	$.append($$anchor, span);
	$.pop();
}