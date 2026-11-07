import * as $ from 'svelte/internal/server';
import Scene from './Scene.svelte';
import { Canvas, T } from '@threlte/core';
import { Checkbox, Color, Folder, Pane, List, Slider, Point } from 'svelte-tweakpane-ui';
import { Grid, TransformControls } from '@threlte/extras';
import { PlaneGeometry } from 'three';
import { SimplexNoise } from 'three/examples/jsm/Addons.js';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let cellSize = 1;
		let cellColor = '#cccccc';
		let cellThickness = 1.4;
		let sectionSize = 5;
		let sectionColor = '#ff3e00';
		let sectionThickness = 2;
		let gridSize = [20, 20];
		const planeOptions = { xz: 'xz', xy: 'xy', zy: 'zy' };
		let plane = 'xz';
		let followCamera = false;
		let infiniteGrid = false;
		let useFadeOrigin = false;
		let fadeOrigin = [0, 0, 0];
		let fadeDistance = 100;
		let backgroundColor = '#003eff';
		let backgroundOpacity = 0;
		let fadeStrength = 1;
		const gridGeometryOptions = { plane: 'default', terrain: 'terrain' };
		let gridGeometry = 'default';
		const gridGeometryIsTerrain = $.derived(() => gridGeometry === 'terrain');

		const gridTypeOptions = {
			polar: 'polar',
			grid: 'grid',
			lines: 'lines',
			circular: 'circular'
		};

		let gridType = 'polar';
		const linesAxisOptions = { x: 'x', y: 'y', z: 'z' };
		let linesAxis = 'x';
		let maxRadius = 10;
		let cellDividers = 6;
		let sectionDividers = 2;
		const terrainSize = 30;
		const segments = 100;
		const noise = new SimplexNoise();
		const geometry = new PlaneGeometry(terrainSize, terrainSize, segments, segments);
		const positions = geometry.getAttribute('position');

		for (let i = 0; i < positions.count; i += 1) {
			const x = positions.getX(i);
			const y = positions.getY(i);
			const height = noise.noise(x / 5, y / 5) * 1 + noise.noise(x / 40, y / 40) * 2;

			positions.setZ(i, height);
		}

		geometry.computeVertexNormals();

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Pane($$renderer, {
				title: '',
				position: 'fixed',
				children: ($$renderer) => {
					Slider($$renderer, {
						label: 'cellSize',
						step: 1,
						min: 1,
						max: 5,
						get value() {
							return cellSize;
						},

						set value($$value) {
							cellSize = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Color($$renderer, {
						label: 'cellColor',
						get value() {
							return cellColor;
						},

						set value($$value) {
							cellColor = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'cellThickness',
						step: 0.1,
						min: 1,
						max: 10,
						get value() {
							return cellThickness;
						},

						set value($$value) {
							cellThickness = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'sectionSize',
						step: 1,
						min: 1,
						max: 50,
						get value() {
							return sectionSize;
						},

						set value($$value) {
							sectionSize = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Color($$renderer, {
						label: 'sectionColor',
						get value() {
							return sectionColor;
						},

						set value($$value) {
							sectionColor = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'sectionThickness',
						step: 0.1,
						min: 1,
						max: 10,
						get value() {
							return sectionThickness;
						},

						set value($$value) {
							sectionThickness = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Point($$renderer, {
						label: 'gridSize',
						step: 1,
						min: 1,
						max: 100,
						get value() {
							return gridSize;
						},

						set value($$value) {
							gridSize = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					List($$renderer, {
						label: 'plane',
						options: planeOptions,
						get value() {
							return plane;
						},

						set value($$value) {
							plane = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'followCamera',
						get value() {
							return followCamera;
						},

						set value($$value) {
							followCamera = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'infiniteGrid',
						get value() {
							return infiniteGrid;
						},

						set value($$value) {
							infiniteGrid = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'useFadeOrigin',
						get value() {
							return useFadeOrigin;
						},

						set value($$value) {
							useFadeOrigin = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'fadeDistance',
						step: 10,
						min: 10,
						max: 400,
						get value() {
							return fadeDistance;
						},

						set value($$value) {
							fadeDistance = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Color($$renderer, {
						label: 'backgroundColor',
						get value() {
							return backgroundColor;
						},

						set value($$value) {
							backgroundColor = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'backgroundOpacity',
						step: 0.01,
						min: 0,
						max: 1,
						get value() {
							return backgroundOpacity;
						},

						set value($$value) {
							backgroundOpacity = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'fadeStrength',
						step: 0.1,
						min: 0,
						max: 20,
						get value() {
							return fadeStrength;
						},

						set value($$value) {
							fadeStrength = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					List($$renderer, {
						options: gridGeometryOptions,
						label: 'grid geometry',
						get value() {
							return gridGeometry;
						},

						set value($$value) {
							gridGeometry = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Folder($$renderer, {
						title: 'Types of Grid',
						children: ($$renderer) => {
							List($$renderer, {
								options: gridTypeOptions,
								label: 'type',
								get value() {
									return gridType;
								},

								set value($$value) {
									gridType = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							if (gridType == 'lines') {
								$$renderer.push('<!--[0-->');

								List($$renderer, {
									options: linesAxisOptions,
									label: 'axis',
									get value() {
										return linesAxis;
									},

									set value($$value) {
										linesAxis = $$value;
										$$settled = false;
									}
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (gridType == 'polar' || gridType == 'circular') {
								$$renderer.push('<!--[0-->');

								Slider($$renderer, {
									label: 'maxRadius',
									step: 1,
									min: 0,
									max: 15,
									get value() {
										return maxRadius;
									},

									set value($$value) {
										maxRadius = $$value;
										$$settled = false;
									}
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (gridType == 'polar') {
								$$renderer.push('<!--[0-->');

								Slider($$renderer, {
									label: 'cellDividers',
									step: 1,
									min: 0,
									max: 18,
									get value() {
										return cellDividers;
									},

									set value($$value) {
										cellDividers = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----> `);

								Slider($$renderer, {
									label: 'sectionDividers',
									step: 1,
									min: 0,
									max: 18,
									get value() {
										return sectionDividers;
									},

									set value($$value) {
										sectionDividers = $$value;
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

			$$renderer.push(`<!----> <div class="svelte-rcrcxk">`);

			Canvas($$renderer, {
				children: ($$renderer) => {
					if (useFadeOrigin) {
						$$renderer.push('<!--[0-->');

						TransformControls($$renderer, {
							onobjectChange: (e) => {
								e.target.object.position.toArray(fadeOrigin);
							}
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (gridGeometryIsTerrain()) {
						$$renderer.push('<!--[0-->');

						Grid($$renderer, {
							'position.y': -2,
							plane,
							cellColor,
							cellSize,
							cellThickness,
							sectionColor,
							sectionSize,
							sectionThickness,
							followCamera,
							infiniteGrid,
							fadeDistance,
							fadeStrength,
							fadeOrigin: useFadeOrigin ? fadeOrigin : undefined,
							gridSize,
							backgroundColor,
							backgroundOpacity,
							type: gridType,
							axis: linesAxis,
							maxRadius,
							cellDividers,
							sectionDividers,
							children: ($$renderer) => {
								T($$renderer, { is: geometry });
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');

						Grid($$renderer, {
							plane,
							cellColor,
							cellSize,
							cellThickness,
							sectionColor,
							sectionSize,
							sectionThickness,
							followCamera,
							infiniteGrid,
							fadeDistance,
							fadeStrength,
							fadeOrigin: useFadeOrigin ? fadeOrigin : undefined,
							gridSize,
							backgroundColor,
							backgroundOpacity,
							type: gridType,
							axis: linesAxis,
							maxRadius,
							cellDividers,
							sectionDividers
						});
					}

					$$renderer.push(`<!--]--> `);
					Scene($$renderer, {});
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
	});
}