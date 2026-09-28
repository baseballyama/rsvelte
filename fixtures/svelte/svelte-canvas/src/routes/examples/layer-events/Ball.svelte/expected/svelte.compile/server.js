import * as $ from 'svelte/internal/server';
import { Layer } from '$lib';
import { spring } from 'svelte/motion';

export default function Ball($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { x, y, color, onclick } = $$props;
		let dragging = false;
		let _x = void 0;
		let _y = void 0;
		const radius = spring(80, { stiffness: 0.15, damping: 0.2 });

		const setup = ({ width, height }) => {
			_x = spring(width * x, { stiffness: 0.15, damping: 0.2 });
			_y = spring(height * y, { stiffness: 0.15, damping: 0.2 });
		};

		const render = ({ context }) => {
			context.globalCompositeOperation = 'screen';
			context.fillStyle = color;
			context.lineWidth = 10;
			context.beginPath();
			context.arc($.store_get($$store_subs ??= {}, '$_x', _x), $.store_get($$store_subs ??= {}, '$_y', _y), $.store_get($$store_subs ??= {}, '$radius', radius), 0, Math.PI * 2);
			context.fill();
			context.stroke();
		};

		const onEnter = () => {
			document.body.style.cursor = 'pointer';
			radius.set(90);
		};

		const onLeave = () => {
			document.body.style.cursor = 'auto';
			dragging = false;
			radius.set(80);
		};

		const onDown = (e) => {
			dragging = true;
			radius.set(120);
			onclick?.();
		};

		const onUp = () => {
			dragging = false;
			radius.set(80);
		};

		const onMove = ({ x, y }) => {
			if (dragging) {
				_x.set(x);
				_y.set(y);
			}
		};

		Layer($$renderer, {
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}