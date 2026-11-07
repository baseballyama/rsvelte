import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="block origin-center"></span>`);
var root_1 = $.from_html(`<div></div>`);

export default function MagnetLines($$anchor, $$props) {
	$.push($$props, true);

	let rows = $.prop($$props, 'rows', 3, 9),
		columns = $.prop($$props, 'columns', 3, 9),
		containerSize = $.prop($$props, 'containerSize', 3, '80vmin'),
		lineColor = $.prop($$props, 'lineColor', 3, '#efefef'),
		lineWidth = $.prop($$props, 'lineWidth', 3, '1vmin'),
		lineHeight = $.prop($$props, 'lineHeight', 3, '6vmin'),
		baseAngle = $.prop($$props, 'baseAngle', 19, () => -10),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, '');

	let container;
	const total = $.derived(() => rows() * columns());

	$.user_effect(() => {
		if (!container) return;

		const items = container.querySelectorAll('span');

		const onMove = (px, py) => {
			items.forEach((item) => {
				const r = item.getBoundingClientRect();
				const cx = r.x + r.width / 2;
				const cy = r.y + r.height / 2;
				const b = px - cx;
				const a = py - cy;
				const c = Math.sqrt(a * a + b * b) || 1;
				const rot = Math.acos(b / c) * 180 / Math.PI * (py > cy ? 1 : -1);

				item.style.setProperty('--rotate', `${rot}deg`);
			});
		};

		const handler = (e) => onMove(e.x, e.y);

		window.addEventListener('pointermove', handler);

		if (items.length) {
			const mid = Math.floor(items.length / 2);
			const r = items[mid].getBoundingClientRect();

			onMove(r.x, r.y);
		}

		return () => window.removeEventListener('pointermove', handler);
	});

	var div = root_1();

	$.each(div, 21, () => Array($.get(total)), $.index, ($$anchor, _) => {
		var span = root();

		$.template_effect(() => $.set_style(span, `background-color:${lineColor() ?? ''};width:${lineWidth() ?? ''};height:${lineHeight() ?? ''};--rotate:${baseAngle() ?? ''}deg;transform:rotate(var(--rotate));will-change:transform;`));
		$.append($$anchor, span);
	});

	$.reset(div);
	$.bind_this(div, ($$value) => container = $$value, () => container);

	$.template_effect(() => {
		$.set_class(div, 1, `grid place-items-center ${className() ?? ''}`);
		$.set_style(div, `grid-template-columns:repeat(${columns() ?? ''},1fr);grid-template-rows:repeat(${rows() ?? ''},1fr);width:${containerSize() ?? ''};height:${containerSize() ?? ''};${style() ?? ''}`);
	});

	$.append($$anchor, div);
	$.pop();
}