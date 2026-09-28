import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

function ellipsePath(cx, cy, rx, ry) {
	return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
}

function circlePath(cx, cy, r) {
	return ellipsePath(cx, cy, r, r);
}

function squarePath(cx, cy, size) {
	const h = size / 2;

	return `M ${cx - h} ${cy - h} L ${cx + h} ${cy - h} L ${cx + h} ${cy + h} L ${cx - h} ${cy + h} Z`;
}

function rectanglePath(cx, cy, w, h) {
	const hw = w / 2;
	const hh = h / 2;

	return `M ${cx - hw} ${cy - hh} L ${cx + hw} ${cy - hh} L ${cx + hw} ${cy + hh} L ${cx - hw} ${cy + hh} Z`;
}

function trianglePath(cx, cy, size) {
	const height = size * Math.sqrt(3) / 2;
	const hs = size / 2;

	return `M ${cx} ${cy - height / 1.5} L ${cx + hs} ${cy + height / 3} L ${cx - hs} ${cy + height / 3} Z`;
}

function starPath(cx, cy, outerR, innerR, points) {
	const step = Math.PI / points;
	let p = '';

	for (let i = 0; i < 2 * points; i++) {
		const r = i % 2 === 0 ? outerR : innerR;
		const a = i * step - Math.PI / 2;
		const x = cx + r * Math.cos(a);
		const y = cy + r * Math.sin(a);

		p += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
	}

	return p + ' Z';
}

function heartPath(cx, cy, size) {
	const s = size / 30;

	return `M ${cx} ${cy + 12 * s} C ${cx - 20 * s} ${cy - 5 * s}, ${cx - 12 * s} ${cy - 18 * s}, ${cx} ${cy - 8 * s} C ${cx + 12 * s} ${cy - 18 * s}, ${cx + 20 * s} ${cy - 5 * s}, ${cx} ${cy + 12 * s}`;
}

function infinityPath(cx, cy, w, h) {
	const hw = w / 2;
	const hh = h / 2;

	return `M ${cx} ${cy} C ${cx + hw * 0.5} ${cy - hh}, ${cx + hw} ${cy - hh}, ${cx + hw} ${cy} C ${cx + hw} ${cy + hh}, ${cx + hw * 0.5} ${cy + hh}, ${cx} ${cy} C ${cx - hw * 0.5} ${cy + hh}, ${cx - hw} ${cy + hh}, ${cx - hw} ${cy} C ${cx - hw} ${cy - hh}, ${cx - hw * 0.5} ${cy - hh}, ${cx} ${cy}`;
}

function wavePath(cx, cy, w, amplitude, waves) {
	const pts = [];
	const segs = waves * 20;
	const hw = w / 2;

	for (let i = 0; i <= segs; i++) {
		const x = cx - hw + w * i / segs;
		const y = cy + Math.sin(i / segs * waves * 2 * Math.PI) * amplitude;

		pts.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
	}

	for (let i = segs; i >= 0; i--) {
		const x = cx - hw + w * i / segs;
		const y = cy - Math.sin(i / segs * waves * 2 * Math.PI) * amplitude;

		pts.push(`L ${x} ${y}`);
	}

	return pts.join(' ') + ' Z';
}

var root = $.from_svg(`<svg width="100%" height="100%" class="absolute inset-0 pointer-events-none"><path fill="none"></path></svg>`);
var root_1 = $.from_html(`<div class="absolute will-change-transform select-none"><div><img draggable="false" class="w-full h-full object-contain"/></div></div>`);
var root_2 = $.from_html(`<div aria-hidden="true"><div><div class="relative w-full h-full"><!> <!></div></div></div>`);

export default function OrbitImages($$anchor, $$props) {
	$.push($$props, true);

	let images = $.prop($$props, 'images', 19, () => []),
		altPrefix = $.prop($$props, 'altPrefix', 3, 'Orbiting image'),
		shape = $.prop($$props, 'shape', 3, 'ellipse'),
		baseWidth = $.prop($$props, 'baseWidth', 3, 1400),
		radiusX = $.prop($$props, 'radiusX', 3, 700),
		radiusY = $.prop($$props, 'radiusY', 3, 170),
		radius = $.prop($$props, 'radius', 3, 300),
		starPoints = $.prop($$props, 'starPoints', 3, 5),
		starInnerRatio = $.prop($$props, 'starInnerRatio', 3, 0.5),
		rotation = $.prop($$props, 'rotation', 19, () => -8),
		duration = $.prop($$props, 'duration', 3, 40),
		itemSize = $.prop($$props, 'itemSize', 3, 64),
		direction = $.prop($$props, 'direction', 3, 'normal'),
		fill = $.prop($$props, 'fill', 3, true),
		width = $.prop($$props, 'width', 3, 100),
		height = $.prop($$props, 'height', 3, 100),
		showPath = $.prop($$props, 'showPath', 3, false),
		pathColor = $.prop($$props, 'pathColor', 3, 'rgba(0,0,0,0.1)'),
		pathWidth = $.prop($$props, 'pathWidth', 3, 2),
		easing = $.prop($$props, 'easing', 3, 'linear'),
		paused = $.prop($$props, 'paused', 3, false),
		responsive = $.prop($$props, 'responsive', 3, false),
		className = $.prop($$props, 'class', 3, '');

	let container;
	let scale = $.state(1);
	let progress = $.state(0);
	const cx = $.derived(() => baseWidth() / 2);
	const cy = $.derived(() => baseWidth() / 2);

	const path = $.derived(() => {
		switch (shape()) {
			case 'circle':
				return circlePath($.get(cx), $.get(cy), radius());

			case 'ellipse':
				return ellipsePath($.get(cx), $.get(cy), radiusX(), radiusY());

			case 'square':
				return squarePath($.get(cx), $.get(cy), radius() * 2);

			case 'rectangle':
				return rectanglePath($.get(cx), $.get(cy), radiusX() * 2, radiusY() * 2);

			case 'triangle':
				return trianglePath($.get(cx), $.get(cy), radius() * 2);

			case 'star':
				return starPath($.get(cx), $.get(cy), radius(), radius() * starInnerRatio(), starPoints());

			case 'heart':
				return heartPath($.get(cx), $.get(cy), radius() * 2);

			case 'infinity':
				return infinityPath($.get(cx), $.get(cy), radiusX() * 2, radiusY() * 2);

			case 'wave':
				return wavePath($.get(cx), $.get(cy), radiusX() * 2, radiusY(), 3);

			case 'custom':
				return $$props.customPath || circlePath($.get(cx), $.get(cy), radius());

			default:
				return ellipsePath($.get(cx), $.get(cy), radiusX(), radiusY());
		}
	});

	$.user_effect(() => {
		if (!responsive() || !container) return;

		const update = () => {
			$.set(scale, container.clientWidth / baseWidth());
		};

		update();

		const ro = new ResizeObserver(update);

		ro.observe(container);

		return () => ro.disconnect();
	});

	function easeFn(t) {
		switch (easing()) {
			case 'easeIn':
				return t * t;

			case 'easeOut':
				return 1 - Math.pow(1 - t, 2);

			case 'easeInOut':
				return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

			default:
				return t;
		}
	}

	$.user_effect(() => {
		if (paused()) return;

		let raf = 0;
		let start = performance.now();
		const sign = direction() === 'reverse' ? -1 : 1;

		const loop = (t) => {
			const elapsed = (t - start) / 1000;
			const cyclePos = elapsed / duration() % 1;

			$.set(progress, sign * easeFn(cyclePos) * 100);
			raf = requestAnimationFrame(loop);
		};

		raf = requestAnimationFrame(loop);

		return () => cancelAnimationFrame(raf);
	});

	const totalItems = $.derived(() => images().length);

	const containerStyle = $.derived(() => {
		const w = responsive()
			? '100%'
			: typeof width() === 'number' ? `${width()}px` : '100%';

		const h = responsive()
			? 'auto'
			: typeof height() === 'number'
				? `${height()}px`
				: typeof width() === 'number' ? `${width()}px` : 'auto';

		return `width:${w};height:${h};${responsive() ? 'aspect-ratio:1/1;' : ''}`;
	});

	var div = root_2();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	{
		var consequent = ($$anchor) => {
			var svg = root();
			var path_1 = $.only_child(svg);

			$.template_effect(() => {
				$.set_attribute(svg, 'viewBox', `0 0 ${baseWidth() ?? ''} ${baseWidth() ?? ''}`);
				$.set_attribute(path_1, 'd', $.get(path));
				$.set_attribute(path_1, 'stroke', pathColor());
				$.set_attribute(path_1, 'stroke-width', pathWidth() / $.get(scale));
			});

			$.append($$anchor, svg);
		};

		$.if(node, ($$render) => {
			if (showPath()) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 17, images, $.index, ($$anchor, src, i) => {
		const itemOffset = $.derived(() => fill() ? i / $.get(totalItems) * 100 : 0);
		const offset = $.derived(() => (($.get(progress) + $.get(itemOffset)) % 100 + 100) % 100);
		var div_3 = root_1();
		var div_4 = $.child(div_3);
		var img = $.only_child(div_4);

		$.reset(div_3);

		$.template_effect(() => {
			$.set_style(div_3, `width:${itemSize() ?? ''}px;height:${itemSize() ?? ''}px;offset-path:path('${$.get(path) ?? ''}');offset-rotate:0deg;offset-anchor:center center;offset-distance:${$.get(offset) ?? ''}%;`);
			$.set_style(div_4, `transform:rotate(${-rotation()}deg);`);
			$.set_attribute(img, 'src', $.get(src));
			$.set_attribute(img, 'alt', `${altPrefix() ?? ''} ${i + 1}`);
		});

		$.append($$anchor, div_3);
	});

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.bind_this(div, ($$value) => container = $$value, () => container);

	$.template_effect(() => {
		$.set_class(div, 1, `relative mx-auto ${className() ?? ''}`);
		$.set_style(div, $.get(containerStyle));

		$.set_class(div_1, 1, $.clsx(responsive()
			? 'absolute left-1/2 top-1/2'
			: 'relative w-full h-full'));

		$.set_style(div_1, `width:${responsive() ? `${baseWidth()}px` : '100%'};height:${responsive() ? `${baseWidth()}px` : '100%'};${responsive()
			? `transform:translate(-50%,-50%) scale(${$.get(scale)});`
			: ''}transform-origin:center center;`);

		$.set_style(div_2, `transform:rotate(${rotation() ?? ''}deg);transform-origin:center center;`);
	});

	$.append($$anchor, div);
	$.pop();
}