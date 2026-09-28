import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { gsap } from 'gsap';

export default function DecayCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			width = 300,
			height = 400,
			image = 'https://picsum.photos/300/400?grayscale',
			baseFrequency = 0.015,
			numOctaves = 5,
			seed = 4,
			maxDisplacement = 400,
			movementBound = 50,
			children
		} = $$props;

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

				if (targetX > movementBound) targetX = movementBound + (targetX - movementBound) * 0.2;
				if (targetX < -movementBound) targetX = -movementBound + (targetX + movementBound) * 0.2;
				if (targetY > movementBound) targetY = movementBound + (targetY - movementBound) * 0.2;
				if (targetY < -movementBound) targetY = -movementBound + (targetY + movementBound) * 0.2;

				imgValues.imgTransforms.x = targetX;
				imgValues.imgTransforms.y = targetY;
				imgValues.imgTransforms.rz = targetRz;

				if (svgRef) gsap.set(svgRef, { x: targetX, y: targetY, rotateZ: targetRz });

				const d = distance(cached.x, cursor.x, cached.y, cursor.y);

				imgValues.displacementScale = lerp(imgValues.displacementScale, map(d, 0, 200, 0, maxDisplacement), 0.06);

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

		$$renderer.push(`<div class="relative"${$.attr_style(`width:${$.stringify(width)}px;height:${$.stringify(height)}px;`)}><svg viewBox="-60 -75 720 900" preserveAspectRatio="xMidYMid slice" class="relative w-full h-full block [will-change:transform]"><filter id="imgFilter"><feTurbulence type="turbulence"${$.attr('baseFrequency', baseFrequency)}${$.attr('numOctaves', numOctaves)}${$.attr('seed', seed)} stitchTiles="stitch" x="0%" y="0%" width="100%" height="100%" result="turbulence1"></feTurbulence><feDisplacementMap in="SourceGraphic" in2="turbulence1" scale="0" xChannelSelector="R" yChannelSelector="B" x="0%" y="0%" width="100%" height="100%" result="displacementMap3"></feDisplacementMap></filter><g><image${$.attr('href', image)} x="0" y="0" width="600" height="750" filter="url(#imgFilter)" preserveAspectRatio="xMidYMid slice"></image></g></svg> <div class="absolute bottom-[1.2em] left-[1em] tracking-[-0.5px] font-black text-[2.5rem] leading-[1.5em] first-line:text-[6rem]">`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}