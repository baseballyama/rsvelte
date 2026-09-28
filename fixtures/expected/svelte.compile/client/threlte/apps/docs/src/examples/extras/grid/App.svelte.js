import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Scene from './Scene.svelte';
import { Canvas, T } from '@threlte/core';
import { Checkbox, Color, Folder, Pane, List, Slider, Point } from 'svelte-tweakpane-ui';
import { Grid, TransformControls } from '@threlte/extras';
import { PlaneGeometry } from 'three';
import { SimplexNoise } from 'three/examples/jsm/Addons.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <div class="svelte-rcrcxk"><!></div>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	let cellSize = $.state(1);
	let cellColor = $.state('#cccccc');
	let cellThickness = $.state(1.4);
	let sectionSize = $.state(5);
	let sectionColor = $.state('#ff3e00');
	let sectionThickness = $.state(2);
	let gridSize = $.state($.proxy([20, 20]));
	const planeOptions = { xz: 'xz', xy: 'xy', zy: 'zy' };
	let plane = $.state('xz');
	let followCamera = $.state(false);
	let infiniteGrid = $.state(false);
	let useFadeOrigin = $.state(false);
	let fadeOrigin = $.proxy([0, 0, 0]);
	let fadeDistance = $.state(100);
	let backgroundColor = $.state('#003eff');
	let backgroundOpacity = $.state(0);
	let fadeStrength = $.state(1);
	const gridGeometryOptions = { plane: 'default', terrain: 'terrain' };
	let gridGeometry = $.state('default');
	const gridGeometryIsTerrain = $.derived(() => $.get(gridGeometry) === 'terrain');

	const gridTypeOptions = {
		polar: 'polar',
		grid: 'grid',
		lines: 'lines',
		circular: 'circular'
	};

	let gridType = $.state('polar');
	const linesAxisOptions = { x: 'x', y: 'y', z: 'z' };
	let linesAxis = $.state('x');
	let maxRadius = $.state(10);
	let cellDividers = $.state(6);
	let sectionDividers = $.state(2);
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

	var fragment = root_4();
	var node = $.first_child(fragment);

	Pane(node, {
		title: '',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_1 = $.first_child(fragment_1);

			Slider(node_1, {
				label: 'cellSize',
				step: 1,
				min: 1,
				max: 5,
				get value() {
					return $.get(cellSize);
				},

				set value($$value) {
					$.set(cellSize, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Color(node_2, {
				label: 'cellColor',
				get value() {
					return $.get(cellColor);
				},

				set value($$value) {
					$.set(cellColor, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Slider(node_3, {
				label: 'cellThickness',
				step: 0.1,
				min: 1,
				max: 10,
				get value() {
					return $.get(cellThickness);
				},

				set value($$value) {
					$.set(cellThickness, $$value, true);
				}
			});

			var node_4 = $.sibling(node_3, 2);

			Slider(node_4, {
				label: 'sectionSize',
				step: 1,
				min: 1,
				max: 50,
				get value() {
					return $.get(sectionSize);
				},

				set value($$value) {
					$.set(sectionSize, $$value, true);
				}
			});

			var node_5 = $.sibling(node_4, 2);

			Color(node_5, {
				label: 'sectionColor',
				get value() {
					return $.get(sectionColor);
				},

				set value($$value) {
					$.set(sectionColor, $$value, true);
				}
			});

			var node_6 = $.sibling(node_5, 2);

			Slider(node_6, {
				label: 'sectionThickness',
				step: 0.1,
				min: 1,
				max: 10,
				get value() {
					return $.get(sectionThickness);
				},

				set value($$value) {
					$.set(sectionThickness, $$value, true);
				}
			});

			var node_7 = $.sibling(node_6, 2);

			Point(node_7, {
				label: 'gridSize',
				step: 1,
				min: 1,
				max: 100,
				get value() {
					return $.get(gridSize);
				},

				set value($$value) {
					$.set(gridSize, $$value, true);
				}
			});

			var node_8 = $.sibling(node_7, 2);

			List(node_8, {
				label: 'plane',
				get options() {
					return planeOptions;
				},

				get value() {
					return $.get(plane);
				},

				set value($$value) {
					$.set(plane, $$value, true);
				}
			});

			var node_9 = $.sibling(node_8, 2);

			Checkbox(node_9, {
				label: 'followCamera',
				get value() {
					return $.get(followCamera);
				},

				set value($$value) {
					$.set(followCamera, $$value, true);
				}
			});

			var node_10 = $.sibling(node_9, 2);

			Checkbox(node_10, {
				label: 'infiniteGrid',
				get value() {
					return $.get(infiniteGrid);
				},

				set value($$value) {
					$.set(infiniteGrid, $$value, true);
				}
			});

			var node_11 = $.sibling(node_10, 2);

			Checkbox(node_11, {
				label: 'useFadeOrigin',
				get value() {
					return $.get(useFadeOrigin);
				},

				set value($$value) {
					$.set(useFadeOrigin, $$value, true);
				}
			});

			var node_12 = $.sibling(node_11, 2);

			Slider(node_12, {
				label: 'fadeDistance',
				step: 10,
				min: 10,
				max: 400,
				get value() {
					return $.get(fadeDistance);
				},

				set value($$value) {
					$.set(fadeDistance, $$value, true);
				}
			});

			var node_13 = $.sibling(node_12, 2);

			Color(node_13, {
				label: 'backgroundColor',
				get value() {
					return $.get(backgroundColor);
				},

				set value($$value) {
					$.set(backgroundColor, $$value, true);
				}
			});

			var node_14 = $.sibling(node_13, 2);

			Slider(node_14, {
				label: 'backgroundOpacity',
				step: 0.01,
				min: 0,
				max: 1,
				get value() {
					return $.get(backgroundOpacity);
				},

				set value($$value) {
					$.set(backgroundOpacity, $$value, true);
				}
			});

			var node_15 = $.sibling(node_14, 2);

			Slider(node_15, {
				label: 'fadeStrength',
				step: 0.1,
				min: 0,
				max: 20,
				get value() {
					return $.get(fadeStrength);
				},

				set value($$value) {
					$.set(fadeStrength, $$value, true);
				}
			});

			var node_16 = $.sibling(node_15, 2);

			List(node_16, {
				get options() {
					return gridGeometryOptions;
				},
				label: 'grid geometry',
				get value() {
					return $.get(gridGeometry);
				},

				set value($$value) {
					$.set(gridGeometry, $$value, true);
				}
			});

			var node_17 = $.sibling(node_16, 2);

			Folder(node_17, {
				title: 'Types of Grid',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_18 = $.first_child(fragment_2);

					List(node_18, {
						get options() {
							return gridTypeOptions;
						},
						label: 'type',
						get value() {
							return $.get(gridType);
						},

						set value($$value) {
							$.set(gridType, $$value, true);
						}
					});

					var node_19 = $.sibling(node_18, 2);

					{
						var consequent = ($$anchor) => {
							List($$anchor, {
								get options() {
									return linesAxisOptions;
								},
								label: 'axis',
								get value() {
									return $.get(linesAxis);
								},

								set value($$value) {
									$.set(linesAxis, $$value, true);
								}
							});
						};

						$.if(node_19, ($$render) => {
							if ($.get(gridType) == 'lines') $$render(consequent);
						});
					}

					var node_20 = $.sibling(node_19, 2);

					{
						var consequent_1 = ($$anchor) => {
							Slider($$anchor, {
								label: 'maxRadius',
								step: 1,
								min: 0,
								max: 15,
								get value() {
									return $.get(maxRadius);
								},

								set value($$value) {
									$.set(maxRadius, $$value, true);
								}
							});
						};

						$.if(node_20, ($$render) => {
							if ($.get(gridType) == 'polar' || $.get(gridType) == 'circular') $$render(consequent_1);
						});
					}

					var node_21 = $.sibling(node_20, 2);

					{
						var consequent_2 = ($$anchor) => {
							var fragment_5 = root();
							var node_22 = $.first_child(fragment_5);

							Slider(node_22, {
								label: 'cellDividers',
								step: 1,
								min: 0,
								max: 18,
								get value() {
									return $.get(cellDividers);
								},

								set value($$value) {
									$.set(cellDividers, $$value, true);
								}
							});

							var node_23 = $.sibling(node_22, 2);

							Slider(node_23, {
								label: 'sectionDividers',
								step: 1,
								min: 0,
								max: 18,
								get value() {
									return $.get(sectionDividers);
								},

								set value($$value) {
									$.set(sectionDividers, $$value, true);
								}
							});

							$.append($$anchor, fragment_5);
						};

						$.if(node_21, ($$render) => {
							if ($.get(gridType) == 'polar') $$render(consequent_2);
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_24 = $.child(div);

	Canvas(node_24, {
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root_3();
			var node_25 = $.first_child(fragment_6);

			{
				var consequent_3 = ($$anchor) => {
					TransformControls($$anchor, {
						onobjectChange: (e) => {
							e.target.object.position.toArray(fadeOrigin);
						}
					});
				};

				$.if(node_25, ($$render) => {
					if ($.get(useFadeOrigin)) $$render(consequent_3);
				});
			}

			var node_26 = $.sibling(node_25, 2);

			{
				var consequent_4 = ($$anchor) => {
					{
						let $0 = $.derived(() => $.get(useFadeOrigin) ? fadeOrigin : undefined);

						Grid($$anchor, {
							'position.y': -2,
							get plane() {
								return $.get(plane);
							},

							get cellColor() {
								return $.get(cellColor);
							},

							get cellSize() {
								return $.get(cellSize);
							},

							get cellThickness() {
								return $.get(cellThickness);
							},

							get sectionColor() {
								return $.get(sectionColor);
							},

							get sectionSize() {
								return $.get(sectionSize);
							},

							get sectionThickness() {
								return $.get(sectionThickness);
							},

							get followCamera() {
								return $.get(followCamera);
							},

							get infiniteGrid() {
								return $.get(infiniteGrid);
							},

							get fadeDistance() {
								return $.get(fadeDistance);
							},

							get fadeStrength() {
								return $.get(fadeStrength);
							},

							get fadeOrigin() {
								return $.get($0);
							},

							get gridSize() {
								return $.get(gridSize);
							},

							get backgroundColor() {
								return $.get(backgroundColor);
							},

							get backgroundOpacity() {
								return $.get(backgroundOpacity);
							},

							get type() {
								return $.get(gridType);
							},

							get axis() {
								return $.get(linesAxis);
							},

							get maxRadius() {
								return $.get(maxRadius);
							},

							get cellDividers() {
								return $.get(cellDividers);
							},

							get sectionDividers() {
								return $.get(sectionDividers);
							},

							children: ($$anchor, $$slotProps) => {
								T($$anchor, {
									get is() {
										return geometry;
									}
								});
							},
							$$slots: { default: true }
						});
					}
				};

				var alternate = ($$anchor) => {
					{
						let $0 = $.derived(() => $.get(useFadeOrigin) ? fadeOrigin : undefined);

						Grid($$anchor, {
							get plane() {
								return $.get(plane);
							},

							get cellColor() {
								return $.get(cellColor);
							},

							get cellSize() {
								return $.get(cellSize);
							},

							get cellThickness() {
								return $.get(cellThickness);
							},

							get sectionColor() {
								return $.get(sectionColor);
							},

							get sectionSize() {
								return $.get(sectionSize);
							},

							get sectionThickness() {
								return $.get(sectionThickness);
							},

							get followCamera() {
								return $.get(followCamera);
							},

							get infiniteGrid() {
								return $.get(infiniteGrid);
							},

							get fadeDistance() {
								return $.get(fadeDistance);
							},

							get fadeStrength() {
								return $.get(fadeStrength);
							},

							get fadeOrigin() {
								return $.get($0);
							},

							get gridSize() {
								return $.get(gridSize);
							},

							get backgroundColor() {
								return $.get(backgroundColor);
							},

							get backgroundOpacity() {
								return $.get(backgroundOpacity);
							},

							get type() {
								return $.get(gridType);
							},

							get axis() {
								return $.get(linesAxis);
							},

							get maxRadius() {
								return $.get(maxRadius);
							},

							get cellDividers() {
								return $.get(cellDividers);
							},

							get sectionDividers() {
								return $.get(sectionDividers);
							}
						});
					}
				};

				$.if(node_26, ($$render) => {
					if ($.get(gridGeometryIsTerrain)) $$render(consequent_4); else $$render(alternate, -1);
				});
			}

			var node_27 = $.sibling(node_26, 2);

			Scene(node_27, {});
			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}