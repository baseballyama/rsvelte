import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { World } from '@threlte/rapier';
import { Button, Checkbox, Folder, Pane, Slider, Text, Textarea } from 'svelte-tweakpane-ui';
import { WebGLRenderer } from 'three';
import Scene from './Scene.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="threlte svelte-108ty3b"><!></div>`);
var root_3 = $.from_html(`<canvas class="svelte-108ty3b"></canvas>`);
var root_4 = $.from_html(`<!> <main class="svelte-108ty3b"><!> <!></main>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	let resets = $.state(0);
	let iteration = $.state(1);
	let useVaryingFramerate = $.state(false);
	let rate = $.state(30);
	let framerate = $.derived(() => $.get(useVaryingFramerate) ? 'varying' : $.get(rate));
	let threlteCanvas = $.state(void 0);
	let otherCanvas = $.state(void 0);
	const otherCanvasCtx = $.derived(() => $.get(otherCanvas)?.getContext('2d') ?? undefined);

	const getThrelteCanvas = (node) => {
		const c = node.querySelector('canvas');

		if (c) $.set(threlteCanvas, c, true);
	};

	const sleeping = () => {
		if (!$.get(threlteCanvas) || !$.get(otherCanvas) || !$.get(otherCanvasCtx)) return;

		if ($.get(otherCanvas).width !== $.get(threlteCanvas).width || $.get(otherCanvas).height !== $.get(threlteCanvas).height) {
			$.get(otherCanvas).width = $.get(threlteCanvas).width;
			$.get(otherCanvas).height = $.get(threlteCanvas).height;
		}

		$.get(otherCanvasCtx).globalAlpha = 0.2;
		$.get(otherCanvasCtx).drawImage($.get(threlteCanvas), 0, 0);
		$.set(iteration, $.get(iteration) + 1);
	};

	var fragment = root_4();
	var node_1 = $.first_child(fragment);

	Pane(node_1, {
		position: 'fixed',
		title: 'Framerate',
		width: 330,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_2 = $.first_child(fragment_1);

			Folder(node_2, {
				title: 'Settings',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					Checkbox(node_3, {
						label: 'Use Varying Framerate',
						get value() {
							return $.get(useVaryingFramerate);
						},

						set value($$value) {
							$.set(useVaryingFramerate, $$value, true);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					Slider(node_4, {
						get disabled() {
							return $.get(useVaryingFramerate);
						},
						label: 'Framerate',
						min: 5,
						max: 200,
						step: 1,
						get value() {
							return $.get(rate);
						},

						set value($$value) {
							$.set(rate, $$value, true);
						}
					});

					var node_5 = $.sibling(node_4, 2);

					Button(node_5, {
						label: ' ',
						title: 'Reset',
						$$events: {
							click: () => {
								$.set(resets, $.get(resets) + 1);
								$.set(iteration, 1);
							}
						}
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_2, 2);

			Folder(node_6, {
				title: 'Diagnostics',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_7 = $.first_child(fragment_3);

					{
						let $0 = $.derived(() => `<World framerate=${$.get(framerate) === 'varying' ? '"varying"' : `{${$.get(framerate)}}`}>\n  <Scene />\n<World>`);

						Textarea(node_7, {
							get value() {
								return $.get($0);
							},
							live: false,
							rows: 3,
							disabled: true
						});
					}

					var node_8 = $.sibling(node_7, 2);

					{
						let $0 = $.derived(() => $.get(iteration).toString());

						Text(node_8, {
							label: 'Iteration',
							get value() {
								return $.get($0);
							},
							live: false,
							disabled: true
						});
					}

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var main = $.sibling(node_1, 2);
	var node_9 = $.child(main);

	$.key(node_9, () => `${$.get(iteration)}-${$.get(resets)}-${$.get(framerate)}`, ($$anchor) => {
		var div = root_2();
		var node_10 = $.child(div);

		Canvas(node_10, {
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
						Scene($$anchor, { sleeping });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$.reset(div);
		$.action(div, ($$node) => getThrelteCanvas?.($$node));
		$.append($$anchor, div);
	});

	var node_11 = $.sibling(node_9, 2);

	$.key(node_11, () => `${$.get(resets)}-${$.get(framerate)}`, ($$anchor) => {
		var canvas_1 = root_3();

		$.bind_this(canvas_1, ($$value) => $.set(otherCanvas, $$value), () => $.get(otherCanvas));
		$.append($$anchor, canvas_1);
	});

	$.reset(main);
	$.append($$anchor, fragment);
	$.pop();
}