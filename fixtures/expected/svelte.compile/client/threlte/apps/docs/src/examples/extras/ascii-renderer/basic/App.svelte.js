import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Scene from './Scene.svelte';
import { AsciiRenderer } from '@threlte/extras';
import { Button, Checkbox, Color, Folder, Pane, Slider, Text } from 'svelte-tweakpane-ui';
import { Canvas } from '@threlte/core';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="svelte-1uh3yaw"><!> <!></div>`);

export default function App($$anchor) {
	let fgColor = $.state('#ff2400');
	let bgColor = $.state('#000000');
	const defaultCharacters = ' .:-+*=%@#';
	let characters = $.state(defaultCharacters);
	let alpha = true;
	let block = $.state(false);
	let color = $.state(false);
	let invert = $.state(true);
	let resolution = $.state(0.1);
	let scale = $.state(1);

	const options = $.derived(() => ({
		alpha,
		block: $.get(block),
		color: $.get(color),
		invert: $.get(invert),
		resolution: $.get(resolution),
		scale: $.get(scale)
	}));

	let autoRotate = $.state(true);
	var div = root_3();
	var node = $.child(div);

	Pane(node, {
		position: 'fixed',
		title: 'AsciiRenderer',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_2();
			var node_1 = $.first_child(fragment);

			Folder(node_1, {
				title: 'scene',
				children: ($$anchor, $$slotProps) => {
					Checkbox($$anchor, {
						label: 'auto rotate',
						get value() {
							return $.get(autoRotate);
						},

						set value($$value) {
							$.set(autoRotate, $$value, true);
						}
					});
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Folder(node_2, {
				title: 'options',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					Slider(node_3, {
						label: 'scale',
						min: 1,
						max: 3,
						step: 1,
						get value() {
							return $.get(scale);
						},

						set value($$value) {
							$.set(scale, $$value, true);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					Slider(node_4, {
						label: 'resolution',
						min: 0.05,
						max: 0.2,
						step: 0.05,
						get value() {
							return $.get(resolution);
						},

						set value($$value) {
							$.set(resolution, $$value, true);
						}
					});

					var node_5 = $.sibling(node_4, 2);

					Checkbox(node_5, {
						label: 'invert',
						get value() {
							return $.get(invert);
						},

						set value($$value) {
							$.set(invert, $$value, true);
						}
					});

					var node_6 = $.sibling(node_5, 2);

					Checkbox(node_6, {
						label: 'color',
						get value() {
							return $.get(color);
						},

						set value($$value) {
							$.set(color, $$value, true);
						}
					});

					var node_7 = $.sibling(node_6, 2);

					{
						var consequent = ($$anchor) => {
							Checkbox($$anchor, {
								label: 'block',
								get value() {
									return $.get(block);
								},

								set value($$value) {
									$.set(block, $$value, true);
								}
							});
						};

						$.if(node_7, ($$render) => {
							if ($.get(color)) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_2, 2);

			Folder(node_8, {
				title: 'props',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_2();
					var node_9 = $.first_child(fragment_4);

					Text(node_9, {
						label: 'characters',
						get value() {
							return $.get(characters);
						},

						set value($$value) {
							$.set(characters, $$value, true);
						}
					});

					var node_10 = $.sibling(node_9, 2);

					Button(node_10, {
						title: 'reset characters',
						$$events: {
							click: () => {
								$.set(characters, defaultCharacters);
							}
						}
					});

					var node_11 = $.sibling(node_10, 2);

					{
						var consequent_1 = ($$anchor) => {
							var fragment_5 = root_1();
							var node_12 = $.first_child(fragment_5);

							Color(node_12, {
								label: 'text color',
								get value() {
									return $.get(fgColor);
								},

								set value($$value) {
									$.set(fgColor, $$value, true);
								}
							});

							var node_13 = $.sibling(node_12, 2);

							Color(node_13, {
								label: 'background color',
								get value() {
									return $.get(bgColor);
								},

								set value($$value) {
									$.set(bgColor, $$value, true);
								}
							});

							$.append($$anchor, fragment_5);
						};

						$.if(node_11, ($$render) => {
							if (!$.get(color)) $$render(consequent_1);
						});
					}

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node, 2);

	Canvas(node_14, {
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root_1();
			var node_15 = $.first_child(fragment_6);

			AsciiRenderer(node_15, {
				get bgColor() {
					return $.get(bgColor);
				},

				get characters() {
					return $.get(characters);
				},

				get fgColor() {
					return $.get(fgColor);
				},

				get options() {
					return $.get(options);
				}
			});

			var node_16 = $.sibling(node_15, 2);

			Scene(node_16, {
				get autoRotate() {
					return $.get(autoRotate);
				}
			});

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}