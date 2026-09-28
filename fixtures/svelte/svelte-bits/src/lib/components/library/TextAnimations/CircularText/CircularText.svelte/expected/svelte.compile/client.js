import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { animate } from "motion";

var root = $.from_html(`<span class="inline-block absolute inset-0 text-2xl transition-all duration-500 ease-[cubic-bezier(0,0,0,1)]"> </span>`);
var root_1 = $.from_html(`<div role="img"></div>`);

export default function CircularText($$anchor, $$props) {
	$.push($$props, true);

	let spinDuration = $.prop($$props, 'spinDuration', 3, 20),
		onHover = $.prop($$props, 'onHover', 3, "speedUp"),
		className = $.prop($$props, 'className', 3, "");

	const letters = $.derived(() => Array.from($$props.text));
	let divEl = $.state(void 0);
	let currentRotation = 0;
	let controls;

	function getRotationTransition(duration, from, loop = true) {
		return {
			from,
			to: from + 360,
			ease: "linear",
			duration,
			repeat: loop ? Infinity : 0
		};
	}

	function startAnimation(duration, scale = 1) {
		if (!$.get(divEl)) return;

		controls?.stop();

		controls = animate($.get(divEl), { rotate: [currentRotation, currentRotation + 360], scale }, {
			rotate: getRotationTransition(duration, currentRotation),
			scale: { type: "spring", damping: 20, stiffness: 300 }
		});

		controls.finished.then(() => {
			currentRotation = (currentRotation + 360) % 360;
		}).catch(() => {});
	}

	$.user_effect(() => {
		void $$props.text;
		void spinDuration();
		void onHover();

		if (!$.get(divEl)) return;

		startAnimation(spinDuration());
	});

	function handleMouseEnter() {
		if (!onHover()) return;

		switch (onHover()) {
			case "slowDown":
				startAnimation(spinDuration() * 2);
				break;

			case "speedUp":
				startAnimation(spinDuration() / 4);
				break;

			case "pause":
				controls?.stop();
				break;

			case "goBonkers":
				startAnimation(spinDuration() / 20, 0.8);
				break;
		}
	}

	function handleMouseLeave() {
		startAnimation(spinDuration());
	}

	var div = root_1();

	$.each(div, 21, () => $.get(letters), $.index, ($$anchor, letter, i) => {
		const rotationDeg = $.derived(() => 360 / $.get(letters).length * i);
		const factor = $.derived(() => Math.PI / $.get(letters).length);
		const x = $.derived(() => $.get(factor) * i);
		const y = $.derived(() => $.get(factor) * i);
		const transform = $.derived(() => `rotateZ(${$.get(rotationDeg)}deg) translate3d(${$.get(x)}px, ${$.get(y)}px, 0)`);
		var span = root();
		let styles;
		var text_1 = $.only_child(span, true);

		$.template_effect(() => {
			styles = $.set_style(span, '', styles, {
				transform: $.get(transform),
				'-webkit-transform': $.get(transform)
			});

			$.set_text(text_1, $.get(letter));
		});

		$.append($$anchor, span);
	});

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(divEl, $$value), () => $.get(divEl));
	$.template_effect(() => $.set_class(div, 1, `m-0 mx-auto rounded-full w-50 h-50 relative font-black text-white text-center cursor-pointer origin-center ${className() ?? ''}`));
	$.event('mouseenter', div, handleMouseEnter);
	$.event('mouseleave', div, handleMouseLeave);
	$.append($$anchor, div);
	$.pop();
}