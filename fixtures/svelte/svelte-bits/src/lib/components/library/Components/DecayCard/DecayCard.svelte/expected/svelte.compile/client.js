import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { gsap } from 'gsap';

var root = $.from_html(`<div class="relative"><svg viewBox="-60 -75 720 900" preserveAspectRatio="xMidYMid slice" class="relative w-full h-full block [will-change:transform]"><filter id="imgFilter"><feTurbulence type="turbulence" stitchTiles="stitch" x="0%" y="0%" width="100%" height="100%" result="turbulence1"></feTurbulence><feDisplacementMap in="SourceGraphic" in2="turbulence1" scale="0" xChannelSelector="R" yChannelSelector="B" x="0%" y="0%" width="100%" height="100%" result="displacementMap3"></feDisplacementMap></filter><g><image x="0" y="0" width="600" height="750" filter="url(#imgFilter)" preserveAspectRatio="xMidYMid slice"></image></g></svg> <div class="absolute bottom-[1.2em] left-[1em] tracking-[-0.5px] font-black text-[2.5rem] leading-[1.5em] first-line:text-[6rem]"><!></div></div>`);

export default function DecayCard($$anchor, $$props) {
	$.push($$props, true);

	let width = $.prop($$props, 'width', 3, 300),
		height = $.prop($$props, 'height', 3, 400),
		image = $.prop($$props, 'image', 3, 'https://picsum.photos/300/400?grayscale'),
		baseFrequency = $.prop($$props, 'baseFrequency', 3, 0.015),
		numOctaves = $.prop($$props, 'numOctaves', 3, 5),
		seed = $.prop($$props, 'seed', 3, 4),
		maxDisplacement = $.prop($$props, 'maxDisplacement', 3, 400),
		movementBound = $.prop($$props, 'movementBound', 3, 50);

	let svgRef;
	let displacementMapRef;

	onMount(() => {
		const lerp = (a, b, n) => (1 - n) * a + n * b;
		const map = (x, a, b, c, d) => (x - a) * (d - c) / (b - a) + c;
		const distance = (x1, x2, y1, y2) => Math.hypot(x1 - x2, y1 - y2);
		const cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
		const cached = { x: cursor.x, y: cursor.y };
		const winsize = { width: window.innerWidth, height: window.innerHeight };

		const onResize = () => {
			winsize.width = window.innerWidth;
			winsize.height = window.innerHeight;
		};

		const onMove = (ev) => {
			cursor.x = ev.clientX;
			cursor.y = ev.clientY;
		};

		window.addEventListener('resize', onResize);
		window.addEventListener('mousemove', onMove);

		const imgValues = { imgTransforms: { x: 0, y: 0, rz: 0 }, displacementScale: 0 };
		let rafId = 0;

		const render = () => {
			let targetX = lerp(imgValues.imgTransforms.x, map(cursor.x, 0, winsize.width, -120, 120), 0.1);
			let targetY = lerp(imgValues.imgTransforms.y, map(cursor.y, 0, winsize.height, -120, 120), 0.1);
			const targetRz = lerp(imgValues.imgTransforms.rz, map(cursor.x, 0, winsize.width, -10, 10), 0.1);

			if (targetX > movementBound()) targetX = movementBound() + (targetX - movementBound()) * 0.2;
			if (targetX < -movementBound()) targetX = -movementBound() + (targetX + movementBound()) * 0.2;
			if (targetY > movementBound()) targetY = movementBound() + (targetY - movementBound()) * 0.2;
			if (targetY < -movementBound()) targetY = -movementBound() + (targetY + movementBound()) * 0.2;

			imgValues.imgTransforms.x = targetX;
			imgValues.imgTransforms.y = targetY;
			imgValues.imgTransforms.rz = targetRz;

			if (svgRef) gsap.set(svgRef, { x: targetX, y: targetY, rotateZ: targetRz });

			const d = distance(cached.x, cursor.x, cached.y, cursor.y);

			imgValues.displacementScale = lerp(imgValues.displacementScale, map(d, 0, 200, 0, maxDisplacement()), 0.06);

			if (displacementMapRef) gsap.set(displacementMapRef, { attr: { scale: imgValues.displacementScale } });

			cached.x = cursor.x;
			cached.y = cursor.y;
			rafId = requestAnimationFrame(render);
		};

		rafId = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener('resize', onResize);
			window.removeEventListener('mousemove', onMove);
		};
	});

	var div = root();
	var svg = $.child(div);
	var filter = $.child(svg);
	var feTurbulence = $.child(filter);
	var feDisplacementMap = $.sibling(feTurbulence);

	$.bind_this(feDisplacementMap, ($$value) => displacementMapRef = $$value, () => displacementMapRef);
	$.reset(filter);

	var g = $.sibling(filter);
	var image_1 = $.only_child(g);

	$.reset(svg);

	var div_1 = $.sibling(svg, 2);
	var node = $.child(div_1);

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

	$.reset(div_1);
	$.reset(div);
	$.bind_this(div, ($$value) => svgRef = $$value, () => svgRef);

	$.template_effect(() => {
		$.set_style(div, `width:${width() ?? ''}px;height:${height() ?? ''}px;`);
		$.set_attribute(feTurbulence, 'baseFrequency', baseFrequency());
		$.set_attribute(feTurbulence, 'numOctaves', numOctaves());
		$.set_attribute(feTurbulence, 'seed', seed());
		$.set_attribute(image_1, 'href', image());
	});

	$.append($$anchor, div);
	$.pop();
}