import * as $ from 'svelte/internal/server';

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

export default function OrbitImages($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			images = [],
			altPrefix = 'Orbiting image',
			shape = 'ellipse',
			customPath,
			baseWidth = 1400,
			radiusX = 700,
			radiusY = 170,
			radius = 300,
			starPoints = 5,
			starInnerRatio = 0.5,
			rotation = -8,
			duration = 40,
			itemSize = 64,
			direction = 'normal',
			fill = true,
			width = 100,
			height = 100,
			showPath = false,
			pathColor = 'rgba(0,0,0,0.1)',
			pathWidth = 2,
			easing = 'linear',
			paused = false,
			responsive = false,
			class: className = ''
		} = $$props;

		let container;
		let scale = 1;
		let progress = 0;
		const cx = $.derived(() => baseWidth / 2);
		const cy = $.derived(() => baseWidth / 2);

		const path = $.derived(() => {
			switch (shape) {
				case 'circle':
					return circlePath(cx(), cy(), radius);

				case 'ellipse':
					return ellipsePath(cx(), cy(), radiusX, radiusY);

				case 'square':
					return squarePath(cx(), cy(), radius * 2);

				case 'rectangle':
					return rectanglePath(cx(), cy(), radiusX * 2, radiusY * 2);

				case 'triangle':
					return trianglePath(cx(), cy(), radius * 2);

				case 'star':
					return starPath(cx(), cy(), radius, radius * starInnerRatio, starPoints);

				case 'heart':
					return heartPath(cx(), cy(), radius * 2);

				case 'infinity':
					return infinityPath(cx(), cy(), radiusX * 2, radiusY * 2);

				case 'wave':
					return wavePath(cx(), cy(), radiusX * 2, radiusY, 3);

				case 'custom':
					return customPath || circlePath(cx(), cy(), radius);

				default:
					return ellipsePath(cx(), cy(), radiusX, radiusY);
			}
		});

		function easeFn(t) {
			switch (easing) {
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

		const totalItems = $.derived(() => images.length);

		const containerStyle = $.derived(() => {
			const w = responsive
				? '100%'
				: typeof width === 'number' ? `${width}px` : '100%';

			const h = responsive
				? 'auto'
				: typeof height === 'number'
					? `${height}px`
					: typeof width === 'number' ? `${width}px` : 'auto';

			return `width:${w};height:${h};${responsive ? 'aspect-ratio:1/1;' : ''}`;
		});

		$$renderer.push(`<div${$.attr_class(`relative mx-auto ${$.stringify(className)}`)}${$.attr_style(containerStyle())} aria-hidden="true"><div${$.attr_class($.clsx(responsive
			? 'absolute left-1/2 top-1/2'
			: 'relative w-full h-full'))}${$.attr_style(`width:${responsive ? `${baseWidth}px` : '100%'};height:${responsive ? `${baseWidth}px` : '100%'};${responsive
			? `transform:translate(-50%,-50%) scale(${scale});`
			: ''}transform-origin:center center;`)}><div class="relative w-full h-full"${$.attr_style(`transform:rotate(${$.stringify(rotation)}deg);transform-origin:center center;`)}>`);

		if (showPath) {
			$$renderer.push(`<!--[0--><svg width="100%" height="100%"${$.attr('viewBox', `0 0 ${$.stringify(baseWidth)} ${$.stringify(baseWidth)}`)} class="absolute inset-0 pointer-events-none"><path${$.attr('d', path())} fill="none"${$.attr('stroke', pathColor)}${$.attr('stroke-width', pathWidth / scale)}></path></svg>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <!--[-->`);

		const each_array = $.ensure_array_like(images);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let src = each_array[i];
			const itemOffset = fill ? i / totalItems() * 100 : 0;
			const offset = ((progress + itemOffset) % 100 + 100) % 100;

			$$renderer.push(`<div class="absolute will-change-transform select-none"${$.attr_style(`width:${$.stringify(itemSize)}px;height:${$.stringify(itemSize)}px;offset-path:path('${$.stringify(path())}');offset-rotate:0deg;offset-anchor:center center;offset-distance:${$.stringify(offset)}%;`)}><div${$.attr_style(`transform:rotate(${$.stringify(-rotation)}deg);`)}><img${$.attr('src', src)}${$.attr('alt', `${$.stringify(altPrefix)} ${$.stringify(i + 1)}`)} draggable="false" class="w-full h-full object-contain"/></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div>`);
	});
}