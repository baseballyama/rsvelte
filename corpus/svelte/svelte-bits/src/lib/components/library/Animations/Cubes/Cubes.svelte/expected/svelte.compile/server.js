import * as $ from 'svelte/internal/server';
import { gsap } from 'gsap';

export default function Cubes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			gridSize = 10,
			cubeSize,
			maxAngle = 45,
			radius = 3,
			easing = 'power3.out',
			duration = { enter: 0.3, leave: 0.6 },
			cellGap,
			borderStyle = '1px solid #fff',
			faceColor = '#120F17',
			shadow = false,
			autoAnimate = true,
			rippleOnClick = true,
			rippleColor = '#fff',
			rippleSpeed = 2,
			class: className = ''
		} = $$props;

		let scene;

		const colGap = $.derived(() => typeof cellGap === 'number'
			? `${cellGap}px`
			: cellGap && cellGap.col !== undefined ? `${cellGap.col}px` : '5%');

		const rowGap = $.derived(() => typeof cellGap === 'number'
			? `${cellGap}px`
			: cellGap && cellGap.row !== undefined ? `${cellGap.row}px` : '5%');

		function tiltAt(rowCenter, colCenter) {
			if (!scene) return;

			scene.querySelectorAll('.cube').forEach((cube) => {
				const r = +cube.dataset.row;
				const c = +cube.dataset.col;
				const dist = Math.hypot(r - rowCenter, c - colCenter);

				if (dist <= radius) {
					const pct = 1 - dist / radius;
					const angle = pct * maxAngle;

					gsap.to(cube, {
						duration: duration.enter,
						ease: easing,
						overwrite: true,
						rotateX: -angle,
						rotateY: angle
					});
				} else {
					gsap.to(cube, {
						duration: duration.leave,
						ease: 'power3.out',
						overwrite: true,
						rotateX: 0,
						rotateY: 0
					});
				}
			});
		}

		function resetAll() {
			if (!scene) return;

			scene.querySelectorAll('.cube').forEach((cube) => gsap.to(cube, {
				duration: duration.leave,
				rotateX: 0,
				rotateY: 0,
				ease: 'power3.out'
			}));
		}

		const cells = $.derived(() => Array.from({ length: gridSize }));

		const wrapStyleParts = $.derived(() => {
			const parts = [
				`--cube-face-border:${borderStyle}`,
				`--cube-face-bg:${faceColor}`,
				`--cube-face-shadow:${shadow === true ? '0 0 6px rgba(0,0,0,.5)' : shadow || 'none'}`
			];

			if (cubeSize) {
				parts.push(`width:${gridSize * cubeSize}px`);
				parts.push(`height:${gridSize * cubeSize}px`);
			}

			return parts.join(';');
		});

		const sceneStyle = $.derived(() => `grid-template-columns:${cubeSize
			? `repeat(${gridSize}, ${cubeSize}px)`
			: `repeat(${gridSize}, 1fr)`};grid-template-rows:${cubeSize
			? `repeat(${gridSize}, ${cubeSize}px)`
			: `repeat(${gridSize}, 1fr)`};column-gap:${colGap()};row-gap:${rowGap()};perspective:99999999px;grid-auto-rows:1fr;`);

		$$renderer.push(`<div${$.attr_class(`relative w-1/2 max-md:w-11/12 aspect-square ${$.stringify(className)}`)}${$.attr_style(wrapStyleParts())}><div class="grid w-full h-full"${$.attr_style(sceneStyle())}><!--[-->`);

		const each_array = $.ensure_array_like(cells());

		for (let r = 0, $$length = each_array.length; r < $$length; r++) {
			let _r = each_array[r];

			$$renderer.push(`<!--[-->`);

			const each_array_1 = $.ensure_array_like(cells());

			for (let c = 0, $$length = each_array_1.length; c < $$length; c++) {
				let _c = each_array_1[c];

				$$renderer.push(`<div class="cube relative w-full h-full aspect-square" style="transform-style:preserve-3d;"${$.attr('data-row', r)}${$.attr('data-col', c)}><span class="absolute pointer-events-none -inset-9"></span> <div class="cube-face absolute inset-0 flex items-center justify-center" style="background:var(--cube-face-bg);border:var(--cube-face-border);box-shadow:var(--cube-face-shadow);transform:translateY(-50%) rotateX(90deg);"></div> <div class="cube-face absolute inset-0 flex items-center justify-center" style="background:var(--cube-face-bg);border:var(--cube-face-border);box-shadow:var(--cube-face-shadow);transform:translateY(50%) rotateX(-90deg);"></div> <div class="cube-face absolute inset-0 flex items-center justify-center" style="background:var(--cube-face-bg);border:var(--cube-face-border);box-shadow:var(--cube-face-shadow);transform:translateX(-50%) rotateY(-90deg);"></div> <div class="cube-face absolute inset-0 flex items-center justify-center" style="background:var(--cube-face-bg);border:var(--cube-face-border);box-shadow:var(--cube-face-shadow);transform:translateX(50%) rotateY(90deg);"></div> <div class="cube-face absolute inset-0 flex items-center justify-center" style="background:var(--cube-face-bg);border:var(--cube-face-border);box-shadow:var(--cube-face-shadow);transform:rotateY(-90deg) translateX(50%) rotateY(90deg);"></div> <div class="cube-face absolute inset-0 flex items-center justify-center" style="background:var(--cube-face-bg);border:var(--cube-face-border);box-shadow:var(--cube-face-shadow);transform:rotateY(90deg) translateX(-50%) rotateY(-90deg);"></div></div>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}