import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CanvasTexture, ClampToEdgeWrapping } from 'three';
import { T, useThrelte } from '@threlte/core';
import { addStops } from '../common.js';
import { untrack } from 'svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'width',
	'height',
	'innerRadius',
	'outerRadius',
	'stops',
	'wrapS',
	'wrapT',
	'attach',
	'children',
	'ref'
]);

export default function RadialGradientTexture($$anchor, $$props) {
	$.push($$props, true);

	let width = $.prop($$props, 'width', 3, 1024),
		height = $.prop($$props, 'height', 3, 1024),
		innerRadius = $.prop($$props, 'innerRadius', 3, 0),
		outerRadius = $.prop($$props, 'outerRadius', 3, 'auto'),
		stops = $.prop($$props, 'stops', 19, () => [{ offset: 0, color: 'black' }, { offset: 1, color: 'white' }]),
		wrapS = $.prop($$props, 'wrapS', 3, ClampToEdgeWrapping),
		wrapT = $.prop($$props, 'wrapT', 3, ClampToEdgeWrapping),
		attach = $.prop($$props, 'attach', 3, 'map'),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const canvas = new OffscreenCanvas(untrack(() => width()), untrack(() => height()));
	const context = canvas.getContext('2d');

	if (context === null) {
		throw new Error('radial gradient texture context is null');
	}

	const texture = new CanvasTexture(canvas);

	$.user_effect(() => {
		canvas.width = width();
		canvas.height = height();
		invalidate();
	});

	$.user_effect(() => {
		texture.wrapS = wrapS();
		texture.wrapT = wrapT() ?? texture.wrapT;
		texture.needsUpdate = true;
		invalidate();
	});

	const gradient = $.derived(() => {
		const halfWidth = 0.5 * width();
		const halfHeight = 0.5 * height();
		const gradient = context.createRadialGradient(halfWidth, halfHeight, innerRadius(), halfWidth, halfHeight, outerRadius() === 'auto' ? Math.hypot(halfWidth, halfHeight) : outerRadius());

		addStops(gradient, stops());

		return gradient;
	});

	const { invalidate } = useThrelte();

	$.user_effect(() => {
		context.fillStyle = $.get(gradient);
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
		texture.needsUpdate = true;
		invalidate();

		return () => {
			context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		};
	});

	T($$anchor, $.spread_props(
		{
			get is() {
				return texture;
			}
		},
		() => props,
		{
			get attach() {
				return attach();
			},

			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop, () => ({ ref: texture }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}