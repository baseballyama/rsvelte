import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { animate } from 'motion';

var root = $.from_html(`<div class="absolute select-none whitespace-nowrap text-3xl"> </div>`);
var root_1 = $.from_html(`<div class="relative w-full h-full"><div class="absolute inset-0 pointer-events-none"></div></div>`);

export default function TextCursor($$anchor, $$props) {
	$.push($$props, true);

	let text = $.prop($$props, 'text', 3, '⚛️'),
		spacing = $.prop($$props, 'spacing', 3, 100),
		followMouseDirection = $.prop($$props, 'followMouseDirection', 3, true),
		randomFloat = $.prop($$props, 'randomFloat', 3, true),
		exitDuration = $.prop($$props, 'exitDuration', 3, 0.5),
		removalInterval = $.prop($$props, 'removalInterval', 3, 30),
		maxPoints = $.prop($$props, 'maxPoints', 3, 5);

	let trail = $.proxy([]);
	let containerEl = $.state(void 0);
	let lastMoveTime = Date.now();
	let idCounter = 0;
	let elsById = $.proxy({});

	function makeRandom() {
		return randomFloat()
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
		animate(node, { opacity: 1 }, { duration: exitDuration(), ease: 'easeOut' });

		if (randomFloat()) {
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

		const controls = animate(node, { opacity: 0, scale: 0 }, { duration: exitDuration(), ease: 'easeOut' });
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
		const overflow = actives.length - maxPoints();

		if (overflow <= 0) return;

		for (let i = 0; i < overflow; i++) markExiting(actives[i]);
	}

	function handleMouseMove(e) {
		if (!$.get(containerEl)) return;

		const rect = $.get(containerEl).getBoundingClientRect();
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

			if (distance >= spacing()) {
				const rawAngle = Math.atan2(dy, dx) * 180 / Math.PI;
				const computedAngle = followMouseDirection() ? rawAngle : 0;
				const steps = Math.floor(distance / spacing());

				for (let i = 1; i <= steps; i++) {
					const t = spacing() * i / distance;

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

	$.user_effect(() => {
		const container = $.get(containerEl);

		if (!container) return;

		container.addEventListener('mousemove', handleMouseMove);

		return () => container.removeEventListener('mousemove', handleMouseMove);
	});

	$.user_effect(() => {
		const interval = setInterval(
			() => {
				if (Date.now() - lastMoveTime > 100) {
					const oldestActive = trail.find((t) => !t.exiting);

					if (oldestActive) markExiting(oldestActive);
				}
			},
			removalInterval()
		);

		return () => clearInterval(interval);
	});

	function nodeEntry(node, item) {
		startEntryAnimations(node, item);

		return { destroy() {} };
	}

	var div = root_1();
	var div_1 = $.child(div);

	$.each(div_1, 21, () => trail, (item) => item.id, ($$anchor, item) => {
		var div_2 = root();
		let styles;
		var text_1 = $.only_child(div_2, true);

		$.bind_this(div_2, ($$value, item) => elsById[item.id] = $$value, (item) => elsById?.[item.id], () => [$.get(item)]);
		$.action(div_2, ($$node, $$action_arg) => nodeEntry?.($$node, $$action_arg), () => $.get(item));

		$.template_effect(() => {
			styles = $.set_style(div_2, '', styles, {
				left: `${$.get(item).x}px`,
				top: `${$.get(item).y}px`,
				'will-change': 'transform, opacity'
			});

			$.set_text(text_1, text());
		});

		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(div);
	$.bind_this(div, ($$value) => $.set(containerEl, $$value), () => $.get(containerEl));
	$.append($$anchor, div);
	$.pop();
}