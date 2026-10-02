import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Edges, HTML, Text, useKeyboard } from '@threlte/extras';
import { fade } from 'svelte/transition';
import { Spring } from 'svelte/motion';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const keyboard = useKeyboard();
		const w = keyboard.key('w');
		const a = keyboard.key('a');
		const s = keyboard.key('s');
		const d = keyboard.key('d');
		const space = keyboard.key('Space');

		const trackedKeys = [
			{ key: w, label: 'W' },
			{ key: a, label: 'A' },
			{ key: s, label: 'S' },
			{ key: d, label: 'D' },
			{ key: space, label: 'Space' }
		];

		const activeColor = '#ff3e00';
		const inactiveColor = '#1a1a1a';
		const activeTextColor = 'white';
		const inactiveTextColor = '#aaaaaa';
		const edgeColor = 'rgba(255, 255, 255, 0.2)';
		const activeEdgeColor = '#ff3e00';
		const dep = -0.1;
		const springOpts = { stiffness: 0.3, damping: 0.6 };
		const wZ = Spring.of(() => w.pressed ? dep : 0, springOpts);
		const aZ = Spring.of(() => a.pressed ? dep : 0, springOpts);
		const sZ = Spring.of(() => s.pressed ? dep : 0, springOpts);
		const dZ = Spring.of(() => d.pressed ? dep : 0, springOpts);
		const spaceZ = Spring.of(() => space.pressed ? dep : 0, springOpts);

		if (T.OrthographicCamera) {
			$$renderer.push('<!--[-->');

			T.OrthographicCamera($$renderer, {
				zoom: 90,
				position: [5, 5, 8],
				makeDefault: true,
				oncreate: (ref) => {
					ref.lookAt(0, 0, 0);
				}
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, { intensity: 0.6 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');
			T.DirectionalLight($$renderer, { position: [5, 5, 5], intensity: 0.8 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				'position.x': 0,
				'position.y': 1.15,
				'position.z': wZ.current,
				children: ($$renderer) => {
					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							'scale.y': 0.9,
							children: ($$renderer) => {
								if (T.BoxGeometry) {
									$$renderer.push('<!--[-->');
									T.BoxGeometry($$renderer, { args: [1, 1, 0.3] });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (T.MeshStandardMaterial) {
									$$renderer.push('<!--[-->');
									T.MeshStandardMaterial($$renderer, { color: w.pressed ? activeColor : inactiveColor });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);
								Edges($$renderer, { color: w.pressed ? activeEdgeColor : edgeColor });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					Text($$renderer, {
						text: 'W',
						fontSize: 0.4,
						color: w.pressed ? activeTextColor : inactiveTextColor,
						anchorX: 'center',
						anchorY: 'middle',
						'position.z': 0.16
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				'position.x': -1.1,
				'position.y': 0,
				'position.z': aZ.current,
				children: ($$renderer) => {
					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							'scale.y': 0.9,
							children: ($$renderer) => {
								if (T.BoxGeometry) {
									$$renderer.push('<!--[-->');
									T.BoxGeometry($$renderer, { args: [1, 1, 0.3] });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (T.MeshStandardMaterial) {
									$$renderer.push('<!--[-->');
									T.MeshStandardMaterial($$renderer, { color: a.pressed ? activeColor : inactiveColor });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);
								Edges($$renderer, { color: a.pressed ? activeEdgeColor : edgeColor });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					Text($$renderer, {
						text: 'A',
						fontSize: 0.4,
						color: a.pressed ? activeTextColor : inactiveTextColor,
						anchorX: 'center',
						anchorY: 'middle',
						'position.z': 0.16
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				'position.x': 0,
				'position.y': 0,
				'position.z': sZ.current,
				children: ($$renderer) => {
					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							'scale.y': 0.9,
							children: ($$renderer) => {
								if (T.BoxGeometry) {
									$$renderer.push('<!--[-->');
									T.BoxGeometry($$renderer, { args: [1, 1, 0.3] });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (T.MeshStandardMaterial) {
									$$renderer.push('<!--[-->');
									T.MeshStandardMaterial($$renderer, { color: s.pressed ? activeColor : inactiveColor });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);
								Edges($$renderer, { color: s.pressed ? activeEdgeColor : edgeColor });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					Text($$renderer, {
						text: 'S',
						fontSize: 0.4,
						color: s.pressed ? activeTextColor : inactiveTextColor,
						anchorX: 'center',
						anchorY: 'middle',
						'position.z': 0.16
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				'position.x': 1.1,
				'position.y': 0,
				'position.z': dZ.current,
				children: ($$renderer) => {
					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							'scale.y': 0.9,
							children: ($$renderer) => {
								if (T.BoxGeometry) {
									$$renderer.push('<!--[-->');
									T.BoxGeometry($$renderer, { args: [1, 1, 0.3] });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (T.MeshStandardMaterial) {
									$$renderer.push('<!--[-->');
									T.MeshStandardMaterial($$renderer, { color: d.pressed ? activeColor : inactiveColor });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);
								Edges($$renderer, { color: d.pressed ? activeEdgeColor : edgeColor });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					Text($$renderer, {
						text: 'D',
						fontSize: 0.4,
						color: d.pressed ? activeTextColor : inactiveTextColor,
						anchorX: 'center',
						anchorY: 'middle',
						'position.z': 0.16
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				'position.x': 0,
				'position.y': -1.15,
				'position.z': spaceZ.current,
				children: ($$renderer) => {
					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							'scale.y': 0.9,
							children: ($$renderer) => {
								if (T.BoxGeometry) {
									$$renderer.push('<!--[-->');
									T.BoxGeometry($$renderer, { args: [3.2, 1, 0.3] });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (T.MeshStandardMaterial) {
									$$renderer.push('<!--[-->');
									T.MeshStandardMaterial($$renderer, { color: space.pressed ? activeColor : inactiveColor });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);
								Edges($$renderer, { color: space.pressed ? activeEdgeColor : edgeColor });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					Text($$renderer, {
						text: 'Space',
						fontSize: 0.35,
						color: space.pressed ? activeTextColor : inactiveTextColor,
						anchorX: 'center',
						anchorY: 'middle',
						'position.z': 0.16
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		Text($$renderer, {
			text: 'Press WASD or Space',
			fontSize: 0.25,
			color: '#666666',
			anchorX: 'center',
			anchorY: 'middle',
			position: [0, 2.4, 0]
		});

		$$renderer.push(`<!----> `);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				position: [0, -2.4, 0],
				children: ($$renderer) => {
					HTML($$renderer, {
						center: true,
						transform: false,
						children: ($$renderer) => {
							$$renderer.push(`<div class="states svelte-dlnivw"><!--[-->`);

							const each_array = $.ensure_array_like(trackedKeys);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let { key, label } = each_array[$$index];

								if (key.justPressed) {
									$$renderer.push(`<!--[0--><span class="badge just-pressed svelte-dlnivw">${$.escape(label)} justPressed</span>`);
								} else if (key.justReleased) {
									$$renderer.push(`<!--[1--><span class="badge just-released svelte-dlnivw">${$.escape(label)} justReleased</span>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							}

							$$renderer.push(`<!--]--></div>`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}