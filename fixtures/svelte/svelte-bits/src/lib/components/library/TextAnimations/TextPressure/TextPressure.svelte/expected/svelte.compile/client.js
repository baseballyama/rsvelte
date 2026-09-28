import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="svelte-flls7y"> </span>`);
var root_1 = $.from_html(`<div class="text-pressure-container svelte-flls7y"><h1></h1></div>`);

export default function TextPressure($$anchor, $$props) {
	$.push($$props, true);

	let text = $.prop($$props, 'text', 3, 'Compressa'),
		fontFamily = $.prop($$props, 'fontFamily', 3, 'Compressa VF'),
		fontUrl = $.prop($$props, 'fontUrl', 3, 'https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2'),
		width = $.prop($$props, 'width', 3, true),
		weight = $.prop($$props, 'weight', 3, true),
		italic = $.prop($$props, 'italic', 3, true),
		alpha = $.prop($$props, 'alpha', 3, false),
		flex = $.prop($$props, 'flex', 3, true),
		stroke = $.prop($$props, 'stroke', 3, false),
		scale = $.prop($$props, 'scale', 3, false),
		textColor = $.prop($$props, 'textColor', 3, '#FFFFFF'),
		strokeColor = $.prop($$props, 'strokeColor', 3, '#FF0000'),
		className = $.prop($$props, 'class', 3, ''),
		minFontSize = $.prop($$props, 'minFontSize', 3, 24);

	let containerEl = $.state(void 0);
	let titleEl = $.state(void 0);
	let spans = [];

	// svelte-ignore state_referenced_locally
	let fontSize = $.state($.proxy(minFontSize()));

	let scaleY = $.state(1);
	let lineHeight = $.state(1);
	const chars = $.derived(() => text().split(''));

	$.user_effect(() => {
		if (typeof document === 'undefined') return;

		try {
			const face = new FontFace(fontFamily(), `url(${fontUrl()})`);

			face.load().then((loaded) => document.fonts.add(loaded)).catch(() => {});
		} catch {
			// FontFace unsupported — silently skip; the fallback family kicks in.
		}
	});

	$.user_effect(() => {
		const mouse = { x: 0, y: 0 };
		const cursor = { x: 0, y: 0 };

		const handleMouseMove = (e) => {
			cursor.x = e.clientX;
			cursor.y = e.clientY;
		};

		const handleTouchMove = (e) => {
			const t = e.touches[0];

			if (!t) return;

			cursor.x = t.clientX;
			cursor.y = t.clientY;
		};

		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('touchmove', handleTouchMove, { passive: true });

		if ($.get(containerEl)) {
			const { left, top, width: w, height: h } = $.get(containerEl).getBoundingClientRect();

			mouse.x = left + w / 2;
			mouse.y = top + h / 2;
			cursor.x = mouse.x;
			cursor.y = mouse.y;
		}

		const dist = (a, b) => {
			const dx = b.x - a.x;
			const dy = b.y - a.y;

			return Math.sqrt(dx * dx + dy * dy);
		};

		const getAttr = (distance, maxDist, minVal, maxVal) => {
			const val = maxVal - Math.abs(maxVal * distance / maxDist);

			return Math.max(minVal, val + minVal);
		};

		let rafId = 0;

		const animate = () => {
			mouse.x += (cursor.x - mouse.x) / 15;
			mouse.y += (cursor.y - mouse.y) / 15;

			if ($.get(titleEl)) {
				const titleRect = $.get(titleEl).getBoundingClientRect();
				const maxDist = titleRect.width / 2;

				spans.forEach((span) => {
					if (!span) return;

					const rect = span.getBoundingClientRect();
					const charCenter = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
					const d = dist(mouse, charCenter);
					const wdth = width() ? Math.floor(getAttr(d, maxDist, 5, 200)) : 100;
					const wght = weight() ? Math.floor(getAttr(d, maxDist, 100, 900)) : 400;
					const italVal = italic() ? getAttr(d, maxDist, 0, 1).toFixed(2) : '0';
					const alphaVal = alpha() ? getAttr(d, maxDist, 0, 1).toFixed(2) : '1';
					const newFontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;

					if (span.style.fontVariationSettings !== newFontVariationSettings) {
						span.style.fontVariationSettings = newFontVariationSettings;
					}

					if (alpha() && span.style.opacity !== alphaVal) {
						span.style.opacity = alphaVal;
					}
				});
			}

			rafId = requestAnimationFrame(animate);
		};

		rafId = requestAnimationFrame(animate);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('touchmove', handleTouchMove);
			cancelAnimationFrame(rafId);
		};
	});

	$.user_effect(() => {
		void $.get(chars).length;
		void minFontSize();
		void scale();

		let timeoutId;

		const setSize = () => {
			if (!$.get(containerEl) || !$.get(titleEl)) return;

			const { width: containerW, height: containerH } = $.get(containerEl).getBoundingClientRect();
			let newFontSize = containerW / ($.get(chars).length / 2);

			newFontSize = Math.max(newFontSize, minFontSize());
			$.set(fontSize, newFontSize, true);
			$.set(scaleY, 1);
			$.set(lineHeight, 1);

			requestAnimationFrame(() => {
				if (!$.get(titleEl)) return;

				const textRect = $.get(titleEl).getBoundingClientRect();

				if (scale() && textRect.height > 0) {
					const yRatio = containerH / textRect.height;

					$.set(scaleY, yRatio);
					$.set(lineHeight, yRatio);
				}
			});
		};

		const debounced = () => {
			if (timeoutId) clearTimeout(timeoutId);

			timeoutId = setTimeout(setSize, 100);
		};

		setSize();
		window.addEventListener('resize', debounced);

		return () => {
			window.removeEventListener('resize', debounced);

			if (timeoutId) clearTimeout(timeoutId);
		};
	});

	var div = root_1();
	var h1 = $.child(div);

	$.each(h1, 21, () => $.get(chars), $.index, ($$anchor, char, i) => {
		var span_1 = root();
		var text_1 = $.only_child(span_1, true);

		$.bind_this(span_1, ($$value, i) => spans[i] = $$value, (i) => spans?.[i], () => [i]);

		$.template_effect(() => {
			$.set_attribute(span_1, 'data-char', $.get(char));
			$.set_style(span_1, `display:inline-block;color:${(stroke() ? 'inherit' : textColor()) ?? ''};`);
			$.set_text(text_1, $.get(char));
		});

		$.append($$anchor, span_1);
	});

	$.reset(h1);
	$.bind_this(h1, ($$value) => $.set(titleEl, $$value), () => $.get(titleEl));
	$.reset(div);
	$.bind_this(div, ($$value) => $.set(containerEl, $$value), () => $.get(containerEl));

	$.template_effect(() => {
		$.set_class(h1, 1, `text-pressure-title ${className() ?? ''} ${flex() ? 'flex-layout' : ''} ${stroke() ? 'has-stroke' : ''}`, 'svelte-flls7y');
		$.set_style(h1, `font-family:${fontFamily() ?? ''};font-size:${$.get(fontSize) ?? ''}px;line-height:${$.get(lineHeight) ?? ''};transform:scale(1, ${$.get(scaleY) ?? ''});color:${textColor() ?? ''};--text-pressure-stroke:${strokeColor() ?? ''};`);
	});

	$.append($$anchor, div);
	$.pop();
}