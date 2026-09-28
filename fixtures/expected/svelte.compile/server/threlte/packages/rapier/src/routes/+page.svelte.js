import * as $ from 'svelte/internal/server';
import { World } from '$lib/index.js';
import { Canvas } from '@threlte/core';
import { WebGLRenderer } from 'three';
import Scene from './Scene.svelte';
import Debug from '../lib/components/Debug/Debug.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let iteration = 1;
		let framerate = 10;
		let threlteCanvas = void 0;
		let otherCanvas = void 0;
		const otherCanvasCtx = $.derived(() => otherCanvas?.getContext('2d') ?? undefined);

		const getThrelteCanvas = (node) => {
			const c = node.querySelector('canvas');

			if (c) threlteCanvas = c;
		};

		const sleeping = () => {
			if (!threlteCanvas || !otherCanvas || !otherCanvasCtx()) return;

			// Set the canvas dimensions only once
			if (otherCanvas.width !== threlteCanvas.width || otherCanvas.height !== threlteCanvas.height) {
				otherCanvas.width = threlteCanvas.width;
				otherCanvas.height = threlteCanvas.height;
			}

			// otherCanvasCtx.globalAlpha = 0.1 // Set the transparency level (0.0 to 1.0)
			otherCanvasCtx().globalAlpha = 0.2;

			otherCanvasCtx().drawImage(threlteCanvas, 0, 0);
			iteration += 1;
		};

		$$renderer.push(`<main class="svelte-zxtx8w"><div class="meta svelte-zxtx8w"><button>Use ${$.escape(framerate === 'varying' ? 'fixed' : 'varying')} framerate</button> <span>Iteration: ${$.escape(iteration)}</span> <span>Framerate: ${$.escape(framerate === 'varying' ? 'varying' : `${framerate} (fixed)`)}</span></div> <!---->`);

		{
			$$renderer.push(`<div class="threlte svelte-zxtx8w">`);

			Canvas($$renderer, {
				createRenderer: (canvas) => {
					return new WebGLRenderer({
						canvas,
						preserveDrawingBuffer: true,
						alpha: true,
						antialias: true
					});
				},

				children: ($$renderer) => {
					World($$renderer, {
						framerate,
						children: ($$renderer) => {
							Debug($$renderer, {});
							$$renderer.push(`<!----> `);
							Scene($$renderer, { sleeping });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!----> <!---->`);

		{
			$$renderer.push(`<canvas class="svelte-zxtx8w"></canvas>`);
		}

		$$renderer.push(`<!----></main>`);
	});
}