import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { createHitCanvas } from 'hit-canvas';
import LayerManager from '../util/LayerManager.svelte';
import { getMaxPixelRatio } from '../util/getMaxPixelRatio';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'width',
	'height',
	'pixelRatio',
	'class',
	'style',
	'autoplay',
	'autoclear',
	'layerEvents',
	'onresize',
	'contextSettings',
	'children'
]);

var root = $.from_html(`<canvas></canvas> <div><!></div>`, 1);

export default function Canvas($$anchor, $$props) {
	$.push($$props, true);

	let style = $.prop($$props, 'style', 3, ''),
		autoplay = $.prop($$props, 'autoplay', 3, false),
		autoclear = $.prop($$props, 'autoclear', 3, true),
		layerEvents = $.prop($$props, 'layerEvents', 3, false),
		handlers = $.rest_props($$props, rest_excludes);

	let canvas;
	let context;
	let layerRef;
	let devicePixelRatio = $.state(2);
	let canvasWidth = $.state(0);
	let canvasHeight = $.state(0);
	const width = $.derived(() => $$props.width ?? $.get(canvasWidth));
	const height = $.derived(() => $$props.height ?? $.get(canvasHeight));

	const pixelRatio = $.derived(() => {
		if ($.get(devicePixelRatio) && $$props.pixelRatio === 'auto') return getMaxPixelRatio($.get(width), $.get(height), $.get(devicePixelRatio));
		if ($$props.pixelRatio && $$props.pixelRatio !== 'auto') return $$props.pixelRatio;

		return $.get(devicePixelRatio);
	});

	const manager = new LayerManager({
		get width() {
			return $.get(width);
		},

		get height() {
			return $.get(height);
		},

		get pixelRatio() {
			return $.get(pixelRatio);
		},

		get autoplay() {
			return autoplay();
		},

		get autoclear() {
			return autoclear();
		},

		get layerEvents() {
			return layerEvents();
		},

		get onresize() {
			return $$props.onresize;
		},
		handlers
	});

	onMount(() => {
		if (layerEvents()) {
			context = createHitCanvas(canvas, $$props.contextSettings);
		} else {
			context = canvas.getContext('2d', $$props.contextSettings);
		}

		manager.init(context, layerRef);
	});

	const redraw = () => manager.redraw();

	var $$exports = {
		redraw,
		get canvas() {
			return canvas;
		},

		set canvas($$value) {
			canvas = $$value;
		},

		get context() {
			return context;
		},

		set context($$value) {
			context = $$value;
		}
	};

	var fragment = root();
	var canvas_1 = $.first_child(fragment);

	$.attribute_effect(
		canvas_1,
		($0) => ({
			class: $$props.class,
			width: $.get(width) * $.get(pixelRatio),
			height: $.get(height) * $.get(pixelRatio),
			style: style(),
			...$0,
			[$.STYLE]: {
				width: $$props.width ? `${$$props.width}px` : '100%',
				height: $$props.height ? `${$$props.height}px` : '100%'
			}
		}),
		[() => manager.createEventHandlers()]
	);

	$.bind_this(canvas_1, ($$value) => canvas = $$value, () => canvas);

	var div = $.sibling(canvas_1, 2);

	$.set_style(div, '', {}, { display: 'none' });

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => layerRef = $$value, () => layerRef);
	$.bind_property('devicePixelRatio', 'resize', $.window, ($$value) => $.set(devicePixelRatio, $$value, true));
	$.bind_element_size(canvas_1, 'clientWidth', ($$value) => $.set(canvasWidth, $$value));
	$.bind_element_size(canvas_1, 'clientHeight', ($$value) => $.set(canvasHeight, $$value));
	$.append($$anchor, fragment);

	return $.pop($$exports);
}