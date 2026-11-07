import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="vp-letter svelte-l6i6p0" aria-hidden="true"> </span>`);
var root_1 = $.from_html(`<span class="vp-space svelte-l6i6p0">&nbsp;</span>`);
var root_2 = $.from_html(`<span class="vp-word svelte-l6i6p0"><!> <!></span>`);
var root_3 = $.from_html(`<span><!> <span class="sr-only svelte-l6i6p0"> </span></span>`);

export default function VariableProximity($$anchor, $$props) {
	$.push($$props, true);

	let label = $.prop($$props, 'label', 3, ''),
		fromFontVariationSettings = $.prop($$props, 'fromFontVariationSettings', 3, "'wght' 400, 'opsz' 9"),
		toFontVariationSettings = $.prop($$props, 'toFontVariationSettings', 3, "'wght' 800, 'opsz' 40"),
		containerRef = $.prop($$props, 'containerRef', 3, null),
		radius = $.prop($$props, 'radius', 3, 50),
		falloff = $.prop($$props, 'falloff', 3, 'linear'),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, '');

	let letterEls = [];

	const parsedSettings = $.derived(() => {
		const parse = (s) => new Map(s.split(',').map((p) => p.trim()).filter(Boolean).map((p) => {
			const [name, value] = p.split(/\s+/);

			return [name.replace(/['"]/g, ''), parseFloat(value)];
		}));

		const from = parse(fromFontVariationSettings());
		const to = parse(toFontVariationSettings());

		return Array.from(from.entries()).map(([axis, fromValue]) => ({ axis, fromValue, toValue: to.get(axis) ?? fromValue }));
	});

	const words = $.derived(() => label().split(' '));

	const wordOffsets = $.derived(() => {
		const offsets = [];
		let n = 0;

		for (const w of $.get(words)) {
			offsets.push(n);
			n += w.length;
		}

		return offsets;
	});

	$.user_effect(() => {
		if (typeof window === 'undefined') return;
		if (!containerRef()) return;

		const mouse = { x: 0, y: 0 };
		let last = { x: NaN, y: NaN };

		const updatePosition = (clientX, clientY) => {
			const rect = containerRef().getBoundingClientRect();

			mouse.x = clientX - rect.left;
			mouse.y = clientY - rect.top;
		};

		const onMouseMove = (e) => updatePosition(e.clientX, e.clientY);

		const onTouchMove = (e) => {
			const t = e.touches[0];

			if (t) updatePosition(t.clientX, t.clientY);
		};

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('touchmove', onTouchMove, { passive: true });

		const calcFalloff = (distance) => {
			const norm = Math.min(Math.max(1 - distance / radius(), 0), 1);

			if (falloff() === 'exponential') return norm ** 2;
			if (falloff() === 'gaussian') return Math.exp(-((distance / (radius() / 2)) ** 2) / 2);

			return norm;
		};

		let raf = 0;

		const tick = () => {
			if (!containerRef()) {
				raf = requestAnimationFrame(tick);

				return;
			}

			if (mouse.x === last.x && mouse.y === last.y) {
				raf = requestAnimationFrame(tick);

				return;
			}

			last = { x: mouse.x, y: mouse.y };

			const containerRect = containerRef().getBoundingClientRect();

			letterEls.forEach((el) => {
				if (!el) return;

				const rect = el.getBoundingClientRect();
				const cx = rect.left + rect.width / 2 - containerRect.left;
				const cy = rect.top + rect.height / 2 - containerRect.top;
				const dx = mouse.x - cx;
				const dy = mouse.y - cy;
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (distance >= radius()) {
					el.style.fontVariationSettings = fromFontVariationSettings();

					return;
				}

				const f = calcFalloff(distance);

				const settings = $.get(parsedSettings).map(({ axis, fromValue, toValue }) => {
					const v = fromValue + (toValue - fromValue) * f;

					return `'${axis}' ${v}`;
				}).join(', ');

				el.style.fontVariationSettings = settings;
			});

			raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('touchmove', onTouchMove);
		};
	});

	var span = root_3();
	var node = $.child(span);

	$.each(node, 17, () => $.get(words), $.index, ($$anchor, word, wIdx) => {
		const letters = $.derived(() => $.get(word).split(''));
		var span_1 = root_2();
		var node_1 = $.child(span_1);

		$.each(node_1, 17, () => $.get(letters), $.index, ($$anchor, letter, lIdx) => {
			const idx = $.derived(() => $.get(wordOffsets)[wIdx] + lIdx);
			var span_2 = root();
			let styles;
			var text = $.only_child(span_2, true);

			$.bind_this(span_2, ($$value, idx) => letterEls[idx] = $$value, (idx) => letterEls?.[idx], () => [$.get(idx)]);

			$.template_effect(() => {
				styles = $.set_style(span_2, '', styles, { 'font-variation-settings': fromFontVariationSettings() });
				$.set_text(text, $.get(letter));
			});

			$.append($$anchor, span_2);
		});

		var node_2 = $.sibling(node_1, 2);

		{
			var consequent = ($$anchor) => {
				var span_3 = root_1();

				$.append($$anchor, span_3);
			};

			$.if(node_2, ($$render) => {
				if (wIdx < $.get(words).length - 1) $$render(consequent);
			});
		}

		$.reset(span_1);
		$.append($$anchor, span_1);
	});

	var span_4 = $.sibling(node, 2);
	var text_1 = $.only_child(span_4, true);

	$.reset(span);

	$.template_effect(() => {
		$.set_class(span, 1, `variable-proximity ${className() ?? ''}`, 'svelte-l6i6p0');
		$.set_style(span, style());
		$.set_text(text_1, label());
	});

	$.delegated('click', span, function (...$$args) {
		$$props.onclick?.apply(this, $$args);
	});

	$.append($$anchor, span);
	$.pop();
}

$.delegate(['click']);