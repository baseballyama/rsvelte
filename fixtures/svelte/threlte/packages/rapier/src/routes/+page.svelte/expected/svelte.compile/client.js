import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { World } from '$lib/index.js';
import { Canvas } from '@threlte/core';
import { WebGLRenderer } from 'three';
import Scene from './Scene.svelte';
import Debug from '../lib/components/Debug/Debug.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="threlte svelte-zxtx8w"><!></div>`);
var root_2 = $.from_html(`<canvas class="svelte-zxtx8w"></canvas>`);
var root_3 = $.from_html(`<main class="svelte-zxtx8w"><div class="meta svelte-zxtx8w"><button> </button> <span> </span> <span> </span></div> <!> <!></main>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let iteration = $.state(1);
	let framerate = $.state(10);
	let threlteCanvas = $.state(void 0);
	let otherCanvas = $.state(void 0);
	const otherCanvasCtx = $.derived(() => $.get(otherCanvas)?.getContext('2d') ?? undefined);

	const getThrelteCanvas = (node) => {
		const c = node.querySelector('canvas');

		if (c) $.set(threlteCanvas, c, true);
	};

	const sleeping = () => {
		if (!$.get(threlteCanvas) || !$.get(otherCanvas) || !$.get(otherCanvasCtx)) return;

		// Set the canvas dimensions only once
		if ($.get(otherCanvas).width !== $.get(threlteCanvas).width || $.get(otherCanvas).height !== $.get(threlteCanvas).height) {
			$.get(otherCanvas).width = $.get(threlteCanvas).width;
			$.get(otherCanvas).height = $.get(threlteCanvas).height;
		}

		// otherCanvasCtx.globalAlpha = 0.1 // Set the transparency level (0.0 to 1.0)
		$.get(otherCanvasCtx).globalAlpha = 0.2;

		$.get(otherCanvasCtx).drawImage($.get(threlteCanvas), 0, 0);
		$.set(iteration, $.get(iteration) + 1);
	};

	var main = root_3();
	var div = $.child(main);
	var button = $.child(div);
	var text = $.only_child(button);
	var span = $.sibling(button, 2);
	var text_1 = $.only_child(span);
	var span_1 = $.sibling(span, 2);
	var text_2 = $.only_child(span_1);

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	$.key(node_1, () => `${$.get(iteration)}-${$.get(framerate)}`, ($$anchor) => {
		var div_1 = root_1();
		var node_2 = $.child(div_1);

		Canvas(node_2, {
			createRenderer: (canvas) => {
				return new WebGLRenderer({
					canvas,
					preserveDrawingBuffer: true,
					alpha: true,
					antialias: true
				});
			},

			children: ($$anchor, $$slotProps) => {
				World($$anchor, {
					get framerate() {
						return $.get(framerate);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_3 = $.first_child(fragment_1);

						Debug(node_3, {});

						var node_4 = $.sibling(node_3, 2);

						Scene(node_4, { sleeping });
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$.reset(div_1);
		$.action(div_1, ($$node) => getThrelteCanvas?.($$node));
		$.append($$anchor, div_1);
	});

	var node_5 = $.sibling(node_1, 2);

	$.key(node_5, () => $.get(framerate), ($$anchor) => {
		var canvas_1 = root_2();

		$.bind_this(canvas_1, ($$value) => $.set(otherCanvas, $$value), () => $.get(otherCanvas));
		$.append($$anchor, canvas_1);
	});

	$.reset(main);

	$.template_effect(() => {
		$.set_text(text, `Use ${$.get(framerate) === 'varying' ? 'fixed' : 'varying'} framerate`);
		$.set_text(text_1, `Iteration: ${$.get(iteration) ?? ''}`);
		$.set_text(text_2, `Framerate: ${$.get(framerate) === 'varying' ? 'varying' : `${$.get(framerate)} (fixed)`}`);
	});

	$.delegated('click', button, () => $.set(framerate, $.get(framerate) === 'varying' ? 30 : 'varying', true));
	$.append($$anchor, main);
	$.pop();
}

$.delegate(['click']);