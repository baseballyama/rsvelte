import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { createHitCanvas } from 'hit-canvas';
import LayerManager from '../util/LayerManager.svelte';
import { getMaxPixelRatio } from '../util/getMaxPixelRatio';

export default function Canvas($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			width: _width,
			height: _height,
			pixelRatio: _pixelRatio,
			class: className,
			style = '',
			autoplay = false,
			autoclear = true,
			layerEvents = false,
			onresize,
			contextSettings,
			children,
			$$slots,
			$$events,
			...handlers
		} = $$props;

		let canvas;
		let context;
		let layerRef;
		let devicePixelRatio = 2;
		let canvasWidth = 0;
		let canvasHeight = 0;
		const width = $.derived(() => _width ?? canvasWidth);
		const height = $.derived(() => _height ?? canvasHeight);

		const pixelRatio = $.derived(() => {
			if (devicePixelRatio && _pixelRatio === 'auto') return getMaxPixelRatio(width(), height(), devicePixelRatio);
			if (_pixelRatio && _pixelRatio !== 'auto') return _pixelRatio;

			return devicePixelRatio;
		});

		const manager = new LayerManager({
			get width() {
				return width();
			},

			get height() {
				return height();
			},

			get pixelRatio() {
				return pixelRatio();
			},

			get autoplay() {
				return autoplay;
			},

			get autoclear() {
				return autoclear;
			},

			get layerEvents() {
				return layerEvents;
			},

			get onresize() {
				return onresize;
			},
			handlers
		});

		onMount(() => {
			if (layerEvents) {
				context = createHitCanvas(canvas, contextSettings);
			} else {
				context = canvas.getContext('2d', contextSettings);
			}

			manager.init(context, layerRef);
		});

		const redraw = () => manager.redraw();

		$$renderer.push(`<canvas${$.attributes(
			{
				class: $.clsx(className),
				width: width() * pixelRatio(),
				height: height() * pixelRatio(),
				style,
				...manager.createEventHandlers()
			},
			void 0,
			void 0,
			{
				width: _width ? `${_width}px` : '100%',
				height: _height ? `${_height}px` : '100%'
			}
		)}></canvas> <div${$.attr_style('', { display: 'none' })}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { redraw, canvas, context });
	});
}