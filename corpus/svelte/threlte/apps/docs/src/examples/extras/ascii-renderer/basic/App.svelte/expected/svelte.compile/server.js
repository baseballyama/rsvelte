import * as $ from 'svelte/internal/server';
import Scene from './Scene.svelte';
import { AsciiRenderer } from '@threlte/extras';
import { Button, Checkbox, Color, Folder, Pane, Slider, Text } from 'svelte-tweakpane-ui';
import { Canvas } from '@threlte/core';

export default function App($$renderer) {
	let fgColor = '#ff2400';
	let bgColor = '#000000';
	const defaultCharacters = ' .:-+*=%@#';
	let characters = defaultCharacters;
	let alpha = true;
	let block = false;
	let color = false;
	let invert = true;
	let resolution = 0.1;
	let scale = 1;
	const options = $.derived(() => ({ alpha, block, color, invert, resolution, scale }));
	let autoRotate = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="svelte-1uh3yaw">`);

		Pane($$renderer, {
			position: 'fixed',
			title: 'AsciiRenderer',
			children: ($$renderer) => {
				Folder($$renderer, {
					title: 'scene',
					children: ($$renderer) => {
						Checkbox($$renderer, {
							label: 'auto rotate',
							get value() {
								return autoRotate;
							},

							set value($$value) {
								autoRotate = $$value;
								$$settled = false;
							}
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Folder($$renderer, {
					title: 'options',
					children: ($$renderer) => {
						Slider($$renderer, {
							label: 'scale',
							min: 1,
							max: 3,
							step: 1,
							get value() {
								return scale;
							},

							set value($$value) {
								scale = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Slider($$renderer, {
							label: 'resolution',
							min: 0.05,
							max: 0.2,
							step: 0.05,
							get value() {
								return resolution;
							},

							set value($$value) {
								resolution = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Checkbox($$renderer, {
							label: 'invert',
							get value() {
								return invert;
							},

							set value($$value) {
								invert = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Checkbox($$renderer, {
							label: 'color',
							get value() {
								return color;
							},

							set value($$value) {
								color = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						if (color) {
							$$renderer.push('<!--[0-->');

							Checkbox($$renderer, {
								label: 'block',
								get value() {
									return block;
								},

								set value($$value) {
									block = $$value;
									$$settled = false;
								}
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Folder($$renderer, {
					title: 'props',
					children: ($$renderer) => {
						Text($$renderer, {
							label: 'characters',
							get value() {
								return characters;
							},

							set value($$value) {
								characters = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);
						Button($$renderer, { title: 'reset characters' });
						$$renderer.push(`<!----> `);

						if (!color) {
							$$renderer.push('<!--[0-->');

							Color($$renderer, {
								label: 'text color',
								get value() {
									return fgColor;
								},

								set value($$value) {
									fgColor = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Color($$renderer, {
								label: 'background color',
								get value() {
									return bgColor;
								},

								set value($$value) {
									bgColor = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!---->`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Canvas($$renderer, {
			children: ($$renderer) => {
				AsciiRenderer($$renderer, { bgColor, characters, fgColor, options: options() });
				$$renderer.push(`<!----> `);
				Scene($$renderer, { autoRotate });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}