import * as $ from 'svelte/internal/server';
import { animate as motionAnimate } from "motion";
import { tick, untrack } from "svelte";
import { watch } from "runed";

export const animate = (node, { transition, ...keyframes } = {}) => {
	let animation = motionAnimate(node, keyframes, transition);

	return {
		update: ({ transition, ...keyframes } = {}) => {
			animation.stop();
			animation = motionAnimate(node, keyframes, transition);
		},

		destroy: () => {
			animation.cancel();
		}
	};
};

export function generateCssFromInitial(initial) {
	const transformMap = {
		x: "translateX",
		y: "translateY",
		z: "translateZ",
		rotateX: "rotateX",
		rotateY: "rotateY",
		rotateZ: "rotateZ",
		scale: "scale",
		scaleX: "scaleX",
		scaleY: "scaleY",
		scaleZ: "scaleZ",
		skewX: "skewX",
		skewY: "skewY"
	};

	const transformProperties = [];
	const otherStyles = [];

	for (const [key, value] of Object.entries(initial ?? {})) {
		if (value === undefined || value === null) continue; // Skip undefined or null values

		if (key in transformMap) {
			// Gestione delle proprietà di transform
			const transformKey = transformMap[key];

			const transformValue = typeof value === "number" && !["scale", "scaleX", "scaleY", "scaleZ"].includes(key)
				? `${value}px`
				: // Aggiungi "px" solo se necessario
				value;

			transformProperties.push(`${transformKey}(${transformValue})`);
		} else {
			// Gestione delle proprietà CSS standard
			const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase(); // Convert camelCase to kebab-case

			const cssValue = typeof value === "number" && key !== "opacity" ? `${value}px` : value; // Aggiungi "px" solo se appropriato

			otherStyles.push(`${cssKey}: ${cssValue};`);
		}
	}

	// Combina le proprietà di transform in una singola stringa
	if (transformProperties.length > 0) {
		otherStyles.push(`transform: ${transformProperties.join(" ")};`);
	}

	return otherStyles.join(" ");
}

export default function Motion($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			tag,
			children,
			initial,
			animate,
			exit,
			transition,
			whileHover,
			whileTap,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let el = void 0;
		let ssrStyle = generateCssFromInitial(initial ?? animate);
		let isHover = false;
		let isTap = false;

		function runAnimation(keyframes, t, _el = el) {
			if (!_el) {
				return;
			}

			return motionAnimate(_el, keyframes, t);
		}

		function onExit(node) {
			const duration = transition?.duration ?? 0.3;

			if (exit) {
				runAnimation(exit, transition, node);

				return { duration: duration * 1000 };
			}

			return { duration: 0 };
		}

		watch(
			[() => animate, () => el, () => transition],
			() => {
				if (!el || !animate) return;

				runAnimation(animate, transition);
			},
			{ lazy: true }
		);

		watch([() => isHover && whileHover, () => isTap && whileTap], () => {
			if (!el) {
				return;
			}

			if (isTap && whileTap) {
				runAnimation(whileTap, transition);
			} else if (isHover && whileHover) {
				runAnimation(whileHover, transition);
			} else if (initial && (whileTap || whileHover)) {
				runAnimation(initial, transition);
			}
		});

		$.element(
			$$renderer,
			tag,
			() => {
				$$renderer.push(`${$.attributes({ style: ssrStyle, ...rest })}`);
			},
			() => {
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			}
		);
	});
}