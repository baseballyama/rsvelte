import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { World } from '@threlte/rapier';
import { Button, Checkbox, Folder, Pane, Slider, Text, Textarea } from 'svelte-tweakpane-ui';
import { WebGLRenderer } from 'three';
import Scene from './Scene.svelte';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let resets = 0;
		let iteration = 1;
		let useVaryingFramerate = false;
		let rate = 30;
		let framerate = $.derived(() => useVaryingFramerate ? 'varying' : rate);
		let threlteCanvas = void 0;
		let otherCanvas = void 0;
		const otherCanvasCtx = $.derived(() => otherCanvas?.getContext('2d') ?? undefined);

		const getThrelteCanvas = (node) => {
			const c = node.querySelector('canvas');

			if (c) threlteCanvas = c;
		};

		const sleeping = () => {
			if (!threlteCanvas || !otherCanvas || !otherCanvasCtx()) return;

			if (otherCanvas.width !== threlteCanvas.width || otherCanvas.height !== threlteCanvas.height) {
				otherCanvas.width = threlteCanvas.width;
				otherCanvas.height = threlteCanvas.height;
			}

			otherCanvasCtx().globalAlpha = 0.2;
			otherCanvasCtx().drawImage(threlteCanvas, 0, 0);
			iteration += 1;
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Pane($$renderer, {
				position: 'fixed',
				title: 'Framerate',
				width: 330,
				children: ($$renderer) => {
					Folder($$renderer, {
						title: 'Settings',
						children: ($$renderer) => {
							Checkbox($$renderer, {
								label: 'Use Varying Framerate',
								get value() {
									return useVaryingFramerate;
								},

								set value($$value) {
									useVaryingFramerate = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Slider($$renderer, {
								disabled: useVaryingFramerate,
								label: 'Framerate',
								min: 5,
								max: 200,
								step: 1,
								get value() {
									return rate;
								},

								set value($$value) {
									rate = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);
							Button($$renderer, { label: ' ', title: 'Reset' });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Folder($$renderer, {
						title: 'Diagnostics',
						children: ($$renderer) => {
							Textarea($$renderer, {
								value: `<World framerate=${framerate() === 'varying' ? '"varying"' : `{${framerate()}}`}>\n  <Scene />\n<World>`,
								live: false,
								rows: 3,
								disabled: true
							});

							$$renderer.push(`<!----> `);

							Text($$renderer, {
								label: 'Iteration',
								value: iteration.toString(),
								live: false,
								disabled: true
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <main class="svelte-108ty3b"><!---->`);

			{
				$$renderer.push(`<div class="threlte svelte-108ty3b">`);

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
							framerate: framerate(),
							children: ($$renderer) => {
								Scene($$renderer, { sleeping });
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
				$$renderer.push(`<canvas class="svelte-108ty3b"></canvas>`);
			}

			$$renderer.push(`<!----></main>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}