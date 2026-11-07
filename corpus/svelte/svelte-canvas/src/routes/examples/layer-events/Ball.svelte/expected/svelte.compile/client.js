import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Layer } from '$lib';
import { spring } from 'svelte/motion';

export default function Ball($$anchor, $$props) {
	$.push($$props, true);

	const $_x = () => $.store_get($.get(_x), '$_x', $$stores);
	const $_y = () => $.store_get($.get(_y), '$_y', $$stores);
	const $radius = () => $.store_get(radius, '$radius', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let dragging = $.state(false);
	let _x = $.state(void 0);
	let _y = $.state(void 0);
	const radius = spring(80, { stiffness: 0.15, damping: 0.2 });

	const setup = ({ width, height }) => {
		$.store_unsub($.set(_x, spring(width * $$props.x, { stiffness: 0.15, damping: 0.2 }), true), '$_x', $$stores);
		$.store_unsub($.set(_y, spring(height * $$props.y, { stiffness: 0.15, damping: 0.2 }), true), '$_y', $$stores);
	};

	const render = ({ context }) => {
		context.globalCompositeOperation = 'screen';
		context.fillStyle = $$props.color;
		context.lineWidth = 10;
		context.beginPath();
		context.arc($_x(), $_y(), $radius(), 0, Math.PI * 2);
		context.fill();
		context.stroke();
	};

	const onEnter = () => {
		document.body.style.cursor = 'pointer';
		radius.set(90);
	};

	const onLeave = () => {
		document.body.style.cursor = 'auto';
		$.set(dragging, false);
		radius.set(80);
	};

	const onDown = (e) => {
		$.set(dragging, true);
		radius.set(120);
		$$props.onclick?.();
	};

	const onUp = () => {
		$.set(dragging, false);
		radius.set(80);
	};

	const onMove = ({ x, y }) => {
		if ($.get(dragging)) {
			$.get(_x).set(x);
			$.get(_y).set(y);
		}
	};

	Layer($$anchor, {
		setup,
		render,
		onmouseenter: onEnter,
		onmouseleave: onLeave,
		onmousedown: onDown,
		onmousemove: onMove,
		onmouseup: onUp,
		ontouchstart: onDown,
		ontouchmove: onMove,
		ontouchend: onUp
	});

	$.pop();
	$$cleanup();
}