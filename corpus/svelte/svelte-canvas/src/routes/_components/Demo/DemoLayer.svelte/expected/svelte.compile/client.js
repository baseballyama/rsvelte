import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Layer } from '$lib';
import { spring, tweened } from 'svelte/motion';
import { quadInOut as easing } from 'svelte/easing';
import { coords, activeLayer } from './store';

export default function DemoLayer($$anchor, $$props) {
	$.push($$props, true);

	const $activeLayer = () => $.store_get(activeLayer, '$activeLayer', $$stores);
	const $coords = () => $.store_get(coords, '$coords', $$stores);
	const $scale = () => $.store_get(scale, '$scale', $$stores);
	const $opacity = () => $.store_get(opacity, '$opacity', $$stores);
	const $blur = () => $.store_get(blur, '$blur', $$stores);
	const $saturation = () => $.store_get(saturation, '$saturation', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
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
	let active = $.derived(() => $activeLayer()?.id === id);
	let inactive = $.derived(() => $activeLayer()?.id && !$.get(active));

	$.user_effect(() => {
		blur.set($.get(inactive) ? 0.018 : 0);
		saturation.set($.get(inactive) ? 0.4 : 1);
		opacity.set($.get(inactive) ? 0.5 : 1);
	});

	$.user_effect(() => {
		scale.set(!$activeLayer()?.id
			? 1
			: (!$.get(active) ? 0.95 : 1.1) + Math.random() / 10);
	});

	let styleActive = $.derived(() => (context) => () => {
		if ($.get(active)) {
			context.setLineDash([4, 4]);
			context.strokeStyle = '#dcdcdc';
			context.lineWidth = 2;
		}

		return $.get(active);
	});

	const _render = ({ context, width, height, time }) => {
		const [x, y] = $coords();

		context.save();
		context.translate(x, y);
		context.scale($scale(), $scale());
		context.translate(-x, -y);
		context.globalAlpha = $opacity();
		context.filter = `blur(${width * $blur()}px) saturate(${$saturation() * 100}%)`;

		$$props.render({
			context,
			width,
			height,
			time,
			active: $.get(styleActive)(context)
		});

		context.restore();
	};

	Layer($$anchor, {
		onpointerenter: () => $.store_set(activeLayer, { name: $$props.name, id }),
		ontouchstart: () => $.store_set(activeLayer, { name: $$props.name, id }),
		onpointerleave: () => $.store_set(activeLayer, null),
		ontouchend: () => $.store_set(activeLayer, null),
		onpointerdown: () => scale.set(0.95),
		onpointerup: () => scale.set(1.1),
		render: _render
	});

	$.pop();
	$$cleanup();
}