import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'tag',
	'children',
	'initial',
	'animate',
	'exit',
	'transition',
	'whileHover',
	'whileTap'
]);

export default function Motion($$anchor, $$props) {
	$.push($$props, true);

	const rest = $.rest_props($$props, rest_excludes);
	let el = $.state(void 0);
	let ssrStyle = $.state($.proxy(generateCssFromInitial($$props.initial ?? $$props.animate)));
	let isHover = $.state(false);
	let isTap = $.state(false);

	function runAnimation(keyframes, t, _el = $.get(el)) {
		if (!_el) {
			return;
		}

		return motionAnimate(_el, keyframes, t);
	}

	function onExit(node) {
		const duration = $$props.transition?.duration ?? 0.3;

		if ($$props.exit) {
			runAnimation($$props.exit, $$props.transition, node);

			return { duration: duration * 1000 };
		}

		return { duration: 0 };
	}

	$.user_effect(() => {
		if (!$.get(el)) return;

		untrack(async () => {
			if ($.get(el) && $$props.initial) {
				$.set(ssrStyle, "");
				await tick();
				await runAnimation($$props.initial, { duration: 0 });
			}

			if ($.get(el) && $$props.animate) {
				runAnimation($$props.animate, $$props.transition);
			}
		});
	});

	watch(
		[
			() => $$props.animate,
			() => $.get(el),
			() => $$props.transition
		],
		() => {
			if (!$.get(el) || !$$props.animate) return;

			runAnimation($$props.animate, $$props.transition);
		},
		{ lazy: true }
	);

	watch(
		[
			() => $.get(isHover) && $$props.whileHover,
			() => $.get(isTap) && $$props.whileTap
		],
		() => {
			if (!$.get(el)) {
				return;
			}

			if ($.get(isTap) && $$props.whileTap) {
				runAnimation($$props.whileTap, $$props.transition);
			} else if ($.get(isHover) && $$props.whileHover) {
				runAnimation($$props.whileHover, $$props.transition);
			} else if ($$props.initial && ($$props.whileTap || $$props.whileHover)) {
				runAnimation($$props.initial, $$props.transition);
			}
		}
	);

	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	$.element(node_1, () => $$props.tag, false, ($$element, $$anchor) => {
		$.bind_this($$element, ($$value) => $.set(el, $$value, true), () => $.get(el));

		var event_handler = () => {
			$.set(isHover, true);
		};

		var event_handler_1 = () => {
			$.set(isHover, false);
		};

		var event_handler_2 = () => {
			$.set(isTap, true);
		};

		var event_handler_3 = () => {
			$.set(isTap, false);
		};

		var event_handler_4 = () => {
			$.set(isTap, true);
		};

		var event_handler_5 = () => {
			$.set(isTap, false);
		};

		$.attribute_effect($$element, () => ({
			style: $.get(ssrStyle),
			onmouseover: event_handler,
			onmouseleave: event_handler_1,
			ontouchstart: event_handler_2,
			ontouchend: event_handler_3,
			onmousedown: event_handler_4,
			onmouseup: event_handler_5,
			...rest
		}));

		$.transition(2, $$element, () => onExit);

		var fragment_1 = $.comment();
		var node_2 = $.first_child(fragment_1);

		$.snippet(node_2, () => $$props.children ?? $.noop);
		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}