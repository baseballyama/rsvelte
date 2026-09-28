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
	'startX',
	'startY',
	'endX',
	'endY',
	'stops',
	'wrapS',
	'wrapT',
	'attach',
	'children',
	'ref'
]);

export default function LinearGradientTexture($$anchor, $$props) {
	$.push($$props, true);

	let width = $.prop($$props, 'width', 3, 1024),
		height = $.prop($$props, 'height', 3, 1024),
		startX = $.prop($$props, 'startX', 3, 0),
		startY = $.prop($$props, 'startY', 3, 0),
		endX = $.prop($$props, 'endX', 3, 0),
		endY = $.prop($$props, 'endY', 19, height),
		stops = $.prop($$props, 'stops', 19, () => [{ offset: 0, color: 'black' }, { offset: 1, color: 'white' }]),
		wrapS = $.prop($$props, 'wrapS', 3, ClampToEdgeWrapping),
		wrapT = $.prop($$props, 'wrapT', 3, ClampToEdgeWrapping),
		attach = $.prop($$props, 'attach', 3, 'map'),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const canvas = new OffscreenCanvas(untrack(() => width()), untrack(() => height()));
	const context = canvas.getContext('2d');

	if (context === null) {
		throw new Error('canvas texture context is null');
	}

	const texture = new CanvasTexture(canvas);

	$.user_effect(() => {
		canvas.width = width();
		canvas.height = height();
		invalidate();
	});

	$.user_effect(() => {
		texture.wrapS = wrapS();
		texture.wrapT = wrapT();
		texture.needsUpdate = true;
		invalidate();
	});

	const gradient = $.derived(() => {
		const gradient = context.createLinearGradient(startX(), startY(), endX(), endY());

		addStops(gradient, stops());

		return gradient;
	});

	const { invalidate } = useThrelte();

	$.user_effect(() => {
		context.save();
		context.fillStyle = $.get(gradient);
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
		context.restore();
		texture.needsUpdate = true;
		invalidate();
	});

	T($$anchor, $.spread_props(
		{
			get is() {
				return texture;
			},

			get attach() {
				return attach();
			}
		},
		() => props,
		{
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