import * as $ from 'svelte/internal/server';
import { animate } from 'motion';

export default function TextCursor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			text = '⚛️',
			spacing = 100,
			followMouseDirection = true,
			randomFloat = true,
			exitDuration = 0.5,
			removalInterval = 30,
			maxPoints = 5
		} = $$props;

		let trail = [];
		let containerEl = void 0;
		let lastMoveTime = Date.now();
		let idCounter = 0;
		let elsById = {};

		function makeRandom() {
			return randomFloat
				? {
					rx: Math.random() * 10 - 5,
					ry: Math.random() * 10 - 5,
					rr: Math.random() * 10 - 5
				}
				: { rx: 0, ry: 0, rr: 0 };
		}

		function startEntryAnimations(node, item) {
			node.style.opacity = '0';
			node.style.transform = `rotate(${item.angle}deg)`;
			animate(node, { opacity: 1 }, { duration: exitDuration, ease: 'easeOut' });

			if (randomFloat) {
				animate(
					node,
					{
						x: [0, item.rx, 0],
						y: [0, item.ry, 0],
						rotate: [item.angle, item.angle + item.rr, item.angle]
					},
					{
						duration: 2,
						ease: 'easeInOut',
						repeat: Infinity,
						repeatType: 'mirror'
					}
				);
			}
		}

		function startExitAnimation(item) {
			const finalize = () => {
				const i = trail.findIndex((t) => t.id === item.id);

				if (i !== -1) trail.splice(i, 1);

				delete elsById[item.id];
			};

			const node = elsById[item.id];

			if (!node) {
				finalize();

				return;
			}

			const controls = animate(node, { opacity: 0, scale: 0 }, { duration: exitDuration, ease: 'easeOut' });
			const finished = controls.finished;

			if (finished && typeof finished.then === 'function') finished.then(finalize, finalize); else finalize();
		}

		function markExiting(item) {
			if (item.exiting) return;

			item.exiting = true;
			startExitAnimation(item);
		}

		function trimToMaxPoints() {
			const actives = trail.filter((t) => !t.exiting);
			const overflow = actives.length - maxPoints;

			if (overflow <= 0) return;

			for (let i = 0; i < overflow; i++) markExiting(actives[i]);
		}

		function handleMouseMove(e) {
			if (!containerEl) return;

			const rect = containerEl.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;
			const actives = trail.filter((t) => !t.exiting);

			if (actives.length === 0) {
				trail.push({
					id: idCounter++,
					x: mouseX,
					y: mouseY,
					angle: 0,
					...makeRandom(),
					exiting: false
				});
			} else {
				const last = actives[actives.length - 1];
				const dx = mouseX - last.x;
				const dy = mouseY - last.y;
				const distance = Math.hypot(dx, dy);

				if (distance >= spacing) {
					const rawAngle = Math.atan2(dy, dx) * 180 / Math.PI;
					const computedAngle = followMouseDirection ? rawAngle : 0;
					const steps = Math.floor(distance / spacing);

					for (let i = 1; i <= steps; i++) {
						const t = spacing * i / distance;

						trail.push({
							id: idCounter++,
							x: last.x + dx * t,
							y: last.y + dy * t,
							angle: computedAngle,
							...makeRandom(),
							exiting: false
						});
					}
				}
			}

			trimToMaxPoints();
			lastMoveTime = Date.now();
		}

		function nodeEntry(node, item) {
			startEntryAnimations(node, item);

			return { destroy() {} };
		}

		$$renderer.push(`<div class="relative w-full h-full"><div class="absolute inset-0 pointer-events-none"><!--[-->`);

		const each_array = $.ensure_array_like(trail);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<div class="absolute select-none whitespace-nowrap text-3xl"${$.attr_style('', {
				left: `${item.x}px`,
				top: `${item.y}px`,
				'will-change': 'transform, opacity'
			})}>${$.escape(text)}</div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}