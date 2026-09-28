import * as $ from 'svelte/internal/server';
import { Layer } from '$lib';
import { spring, tweened } from 'svelte/motion';
import { quadInOut as easing } from 'svelte/easing';
import { coords, activeLayer } from './store';

export default function DemoLayer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { name, render } = $$props;
		const id = Symbol();

		const styleTween = (initial) => {
			const tween = tweened(initial, { duration: 250, easing });

			return {
				subscribe: tween.subscribe,
				set: (value) => tween.set(value, { delay: Math.random() * 50 + 10 })
			};
		};

		const blur = styleTween(0);
		const saturation = styleTween(1);
		const opacity = styleTween(1);
		const scale = spring(1, { stiffness: 0.1, damping: 0.2 });
		let active = $.derived(() => $.store_get($$store_subs ??= {}, '$activeLayer', activeLayer)?.id === id);
		let inactive = $.derived(() => $.store_get($$store_subs ??= {}, '$activeLayer', activeLayer)?.id && !active());

		let styleActive = $.derived(() => (context) => () => {
			if (active()) {
				context.setLineDash([4, 4]);
				context.strokeStyle = '#dcdcdc';
				context.lineWidth = 2;
			}

			return active();
		});

		const _render = ({ context, width, height, time }) => {
			const [x, y] = $.store_get($$store_subs ??= {}, '$coords', coords);

			context.save();
			context.translate(x, y);
			context.scale($.store_get($$store_subs ??= {}, '$scale', scale), $.store_get($$store_subs ??= {}, '$scale', scale));
			context.translate(-x, -y);
			context.globalAlpha = $.store_get($$store_subs ??= {}, '$opacity', opacity);
			context.filter = `blur(${width * $.store_get($$store_subs ??= {}, '$blur', blur)}px) saturate(${$.store_get($$store_subs ??= {}, '$saturation', saturation) * 100}%)`;
			render({ context, width, height, time, active: styleActive()(context) });
			context.restore();
		};

		Layer($$renderer, {
			onpointerenter: () => $.store_set(activeLayer, { name, id }),
			ontouchstart: () => $.store_set(activeLayer, { name, id }),
			onpointerleave: () => $.store_set(activeLayer, null),
			ontouchend: () => $.store_set(activeLayer, null),
			onpointerdown: () => scale.set(0.95),
			onpointerup: () => scale.set(1.1),
			render: _render
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}