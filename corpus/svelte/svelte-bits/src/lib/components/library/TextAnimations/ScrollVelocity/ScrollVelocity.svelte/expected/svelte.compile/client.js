import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<div><div></div></div>`);
var root_2 = $.from_html(`<section class="svelte-185a7au"></section>`);

export default function ScrollVelocity($$anchor, $$props) {
	$.push($$props, true);

	let scrollContainer = $.prop($$props, 'scrollContainer', 3, null),
		texts = $.prop($$props, 'texts', 19, () => []),
		velocity = $.prop($$props, 'velocity', 3, 100),
		className = $.prop($$props, 'class', 3, ''),
		damping = $.prop($$props, 'damping', 3, 50),
		stiffness = $.prop($$props, 'stiffness', 3, 400),
		numCopies = $.prop($$props, 'numCopies', 3, 6),
		velocityMapping = $.prop($$props, 'velocityMapping', 19, () => ({ input: [0, 1000], output: [0, 5] })),
		parallaxClass = $.prop($$props, 'parallaxClass', 3, 'parallax'),
		scrollerClass = $.prop($$props, 'scrollerClass', 3, 'scroller'),
		parallaxStyle = $.prop($$props, 'parallaxStyle', 3, ''),
		scrollerStyle = $.prop($$props, 'scrollerStyle', 3, '');

	let copyEls = $.proxy([]);
	let scrollerEls = $.proxy([]);

	function wrap(min, max, v) {
		const range = max - min;
		const mod = ((v - min) % range + range) % range;

		return mod + min;
	}

	$.user_effect(() => {
		if (typeof window === 'undefined') return;

		const target = scrollContainer() ?? window;

		const getScrollY = () => target === window
			? window.scrollY || window.pageYOffset || 0
			: target.scrollTop;

		const count = texts().length;
		const baseX = new Array(count).fill(0);
		const directionFactors = new Array(count).fill(1);
		let prevScrollY = getScrollY();
		let smoothVelocity = 0;
		let springVel = 0;
		let lastTime = performance.now();
		const [iMin, iMax] = velocityMapping()?.input ?? [0, 1000];
		const [oMin, oMax] = velocityMapping()?.output ?? [0, 5];
		const inputSpan = iMax - iMin || 1;
		let raf = 0;

		const tick = (t) => {
			const dtRaw = (t - lastTime) / 1000;
			const dt = Math.min(dtRaw, 0.05);

			lastTime = t;

			const sy = getScrollY();
			const scrollVelocity = dtRaw > 0 ? (sy - prevScrollY) / dtRaw : 0;

			prevScrollY = sy;

			const accel = stiffness() * (scrollVelocity - smoothVelocity) - damping() * springVel;

			springVel += accel * dt;
			smoothVelocity += springVel * dt;

			const velocityFactor = (smoothVelocity - iMin) / inputSpan * (oMax - oMin) + oMin;

			for (let i = 0; i < count; i++) {
				const baseVelocity = i % 2 !== 0 ? -velocity() : velocity();
				let moveBy = directionFactors[i] * baseVelocity * dt;

				if (velocityFactor < 0) directionFactors[i] = -1; else if (velocityFactor > 0) directionFactors[i] = 1;

				moveBy += directionFactors[i] * moveBy * velocityFactor;
				baseX[i] += moveBy;

				const copy = copyEls[i];
				const scroller = scrollerEls[i];

				if (!copy || !scroller) continue;

				const copyWidth = copy.offsetWidth;

				if (copyWidth > 0) {
					const x = wrap(-copyWidth, 0, baseX[i]);

					scroller.style.transform = `translate3d(${x}px, 0, 0)`;
				}
			}

			raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);

		return () => cancelAnimationFrame(raf);
	});

	var section = root_2();

	$.each(section, 21, texts, $.index, ($$anchor, text, i) => {
		var div = root_1();
		var div_1 = $.child(div);

		$.each(div_1, 20, () => Array.from({ length: Math.max(numCopies(), 1) }, (_, j) => j), (j) => j, ($$anchor, j) => {
			var fragment = $.comment();
			var node = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					var span = root();
					var text_1 = $.only_child(span);

					$.bind_this(span, ($$value, i) => copyEls[i] = $$value, (i) => copyEls?.[i], () => [i]);

					$.template_effect(() => {
						$.set_class(span, 1, $.clsx(className()));
						$.set_text(text_1, `${$.get(text) ?? ''} `);
					});

					$.append($$anchor, span);
				};

				var alternate = ($$anchor) => {
					var span_1 = root();
					var text_2 = $.only_child(span_1);

					$.template_effect(() => {
						$.set_class(span_1, 1, $.clsx(className()));
						$.set_text(text_2, `${$.get(text) ?? ''} `);
					});

					$.append($$anchor, span_1);
				};

				$.if(node, ($$render) => {
					if (j === 0) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment);
		});

		$.reset(div_1);
		$.bind_this(div_1, ($$value, i) => scrollerEls[i] = $$value, (i) => scrollerEls?.[i], () => [i]);
		$.reset(div);

		$.template_effect(() => {
			$.set_class(div, 1, $.clsx(parallaxClass()));
			$.set_style(div, parallaxStyle());
			$.set_class(div_1, 1, $.clsx(scrollerClass()));
			$.set_style(div_1, scrollerStyle());
		});

		$.append($$anchor, div);
	});

	$.reset(section);
	$.append($$anchor, section);
	$.pop();
}