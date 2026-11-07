import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div role="presentation"><canvas class="absolute inset-0 pointer-events-none"></canvas> <!></div>`);

export default function ClickSpark($$anchor, $$props) {
	$.push($$props, true);

	let sparkColor = $.prop($$props, 'sparkColor', 3, '#fff'),
		sparkSize = $.prop($$props, 'sparkSize', 3, 10),
		sparkRadius = $.prop($$props, 'sparkRadius', 3, 15),
		sparkCount = $.prop($$props, 'sparkCount', 3, 8),
		duration = $.prop($$props, 'duration', 3, 400),
		easing = $.prop($$props, 'easing', 3, 'ease-out'),
		extraScale = $.prop($$props, 'extraScale', 3, 1.0),
		className = $.prop($$props, 'class', 3, '');

	let canvas;
	let wrapper;
	const sparks = [];

	function easeFunc(t) {
		switch (easing()) {
			case 'linear':
				return t;

			case 'ease-in':
				return t * t;

			case 'ease-in-out':
				return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

			default:
				return t * (2 - t);
		}
	}

	$.user_effect(() => {
		if (!canvas || !wrapper) return;

		let resizeTimeout;

		const resizeCanvas = () => {
			const { width, height } = wrapper.getBoundingClientRect();

			if (canvas.width !== width || canvas.height !== height) {
				canvas.width = width;
				canvas.height = height;
			}
		};

		const ro = new ResizeObserver(() => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(resizeCanvas, 100);
		});

		ro.observe(wrapper);
		resizeCanvas();

		const ctx = canvas.getContext('2d');

		if (!ctx) return;

		let raf = 0;

		const draw = (timestamp) => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			for (let i = sparks.length - 1; i >= 0; i--) {
				const spark = sparks[i];
				const elapsed = timestamp - spark.startTime;

				if (elapsed >= duration()) {
					sparks.splice(i, 1);

					continue;
				}

				const progress = elapsed / duration();
				const eased = easeFunc(progress);
				const distance = eased * sparkRadius() * extraScale();
				const lineLength = sparkSize() * (1 - eased);
				const x1 = spark.x + distance * Math.cos(spark.angle);
				const y1 = spark.y + distance * Math.sin(spark.angle);
				const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
				const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

				ctx.strokeStyle = sparkColor();
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(x1, y1);
				ctx.lineTo(x2, y2);
				ctx.stroke();
			}

			raf = requestAnimationFrame(draw);
		};

		raf = requestAnimationFrame(draw);

		return () => {
			ro.disconnect();
			clearTimeout(resizeTimeout);
			cancelAnimationFrame(raf);
		};
	});

	function handleClick(e) {
		if (!canvas) return;

		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const now = performance.now();

		for (let i = 0; i < sparkCount(); i++) {
			sparks.push({ x, y, angle: 2 * Math.PI * i / sparkCount(), startTime: now });
		}
	}

	var div = root();
	var canvas_1 = $.child(div);

	$.bind_this(canvas_1, ($$value) => canvas = $$value, () => canvas);

	var node = $.sibling(canvas_1, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => wrapper = $$value, () => wrapper);
	$.template_effect(() => $.set_class(div, 1, `relative w-full h-full ${className() ?? ''}`));
	$.delegated('click', div, handleClick);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);