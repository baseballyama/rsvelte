import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { isInstanceOf, T, useTask, useThrelte } from '@threlte/core';
import { Color, DoubleSide, Plane, Uniform, Vector3, Mesh } from 'three';
import { fragmentShader, vertexShader } from './gridShaders.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'cellSize',
	'sectionSize',
	'cellColor',
	'sectionColor',
	'backgroundColor',
	'backgroundOpacity',
	'fadeDistance',
	'fadeStrength',
	'cellThickness',
	'sectionThickness',
	'plane',
	'gridSize',
	'followCamera',
	'infiniteGrid',
	'fadeOrigin',
	'side',
	'type',
	'axis',
	'maxRadius',
	'cellDividers',
	'sectionDividers',
	'ref',
	'children'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Grid($$anchor, $$props) {
	$.push($$props, true);

	let cellSize = $.prop($$props, 'cellSize', 3, 1),
		sectionSize = $.prop($$props, 'sectionSize', 3, 10),
		cellColor = $.prop($$props, 'cellColor', 3, '#000000'),
		sectionColor = $.prop($$props, 'sectionColor', 3, '#0000ee'),
		backgroundColor = $.prop($$props, 'backgroundColor', 3, '#dadada'),
		backgroundOpacity = $.prop($$props, 'backgroundOpacity', 3, 0),
		fadeDistance = $.prop($$props, 'fadeDistance', 3, 100),
		fadeStrength = $.prop($$props, 'fadeStrength', 3, 1),
		cellThickness = $.prop($$props, 'cellThickness', 3, 1),
		sectionThickness = $.prop($$props, 'sectionThickness', 3, 2),
		plane = $.prop($$props, 'plane', 3, 'xz'),
		gridSize = $.prop($$props, 'gridSize', 19, () => [20, 20]),
		followCamera = $.prop($$props, 'followCamera', 3, false),
		infiniteGrid = $.prop($$props, 'infiniteGrid', 3, false),
		side = $.prop($$props, 'side', 3, DoubleSide),
		type = $.prop($$props, 'type', 3, 'grid'),
		axis = $.prop($$props, 'axis', 3, 'x'),
		maxRadius = $.prop($$props, 'maxRadius', 3, 0),
		cellDividers = $.prop($$props, 'cellDividers', 3, 6),
		sectionDividers = $.prop($$props, 'sectionDividers', 3, 2),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const mesh = new Mesh();
	const { invalidate, camera } = useThrelte();
	const gridPlane = new Plane();
	const gridPlaneNormal = new Vector3(0, 1, 0);
	const zeroVector = new Vector3(0, 0, 0);
	const axisToInt = { x: 0, y: 1, z: 2 };

	const planeConfig = {
		xz: { axes: 'xzy', normal: [0, 1, 0] },
		xy: { axes: 'xyz', normal: [0, 0, 1] },
		zy: { axes: 'zyx', normal: [1, 0, 0] }
	};

	const gridType = { grid: 0, lines: 1, circular: 2, polar: 3 };

	const uniforms = {
		cellSize: new Uniform(1),
		sectionSize: new Uniform(10),
		cellColor: new Uniform(new Color('#000000')),
		sectionColor: new Uniform(new Color('#0000ee')),
		backgroundColor: new Uniform(new Color('#dadada')),
		backgroundOpacity: new Uniform(0),
		fadeDistance: new Uniform(100),
		fadeStrength: new Uniform(1),
		fadeOrigin: new Uniform(new Vector3()),
		cellThickness: new Uniform(1),
		sectionThickness: new Uniform(2),
		infiniteGrid: new Uniform(false),
		followCamera: new Uniform(false),
		coord0: new Uniform(0),
		coord1: new Uniform(2),
		coord2: new Uniform(1),
		gridType: new Uniform(gridType.grid),
		lineGridCoord: new Uniform(axisToInt.x),
		circleGridMaxRadius: new Uniform(0),
		polarCellDividers: new Uniform(6),
		polarSectionDividers: new Uniform(2),
		worldCamProjPosition: new Uniform(new Vector3()),
		worldPlanePosition: new Uniform(new Vector3())
	};

	$.user_pre_effect(() => {
		// convert axis string to int indexes xzy = [0,2,1]
		const { axes, normal } = planeConfig[plane()];

		const c0 = axes.charAt(0);
		const c1 = axes.charAt(1);
		const c2 = axes.charAt(2);

		uniforms.coord0.value = axisToInt[c0];
		uniforms.coord1.value = axisToInt[c1];
		uniforms.coord2.value = axisToInt[c2];
		gridPlaneNormal.set(normal[0], normal[1], normal[2]);
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.cellSize.value = cellSize();
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.sectionSize.value = sectionSize();
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.cellColor.value.set(cellColor());
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.sectionColor.value.set(sectionColor());
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.backgroundColor.value.set(backgroundColor());
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.backgroundOpacity.value = backgroundOpacity();
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.fadeDistance.value = fadeDistance();
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.fadeStrength.value = fadeStrength();
		invalidate();
	});

	$.user_pre_effect(() => {
		if ($$props.fadeOrigin) {
			if (isInstanceOf($$props.fadeOrigin, 'Vector3')) {
				uniforms.fadeOrigin.value.copy($$props.fadeOrigin);
			} else {
				uniforms.fadeOrigin.value.fromArray($$props.fadeOrigin);
			}
		}

		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.cellThickness.value = cellThickness();
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.sectionThickness.value = sectionThickness();
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.followCamera.value = followCamera();
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.infiniteGrid.value = infiniteGrid();
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.gridType.value = gridType[type()];
		uniforms.lineGridCoord.value = axisToInt[axis()];
		uniforms.circleGridMaxRadius.value = maxRadius();
		uniforms.polarCellDividers.value = cellDividers();
		uniforms.polarSectionDividers.value = sectionDividers();
		invalidate();
	});

	useTask(
		() => {
			gridPlane.setFromNormalAndCoplanarPoint(gridPlaneNormal, zeroVector).applyMatrix4(mesh.matrixWorld);

			const material = mesh.material;
			const worldCamProjPosition = material.uniforms.worldCamProjPosition;
			const worldPlanePosition = material.uniforms.worldPlanePosition;
			const uFadeOrigin = material.uniforms.fadeOrigin;
			const projectedPoint = gridPlane.projectPoint(camera.current.position, worldCamProjPosition.value);

			if (!$$props.fadeOrigin) {
				uFadeOrigin.value.copy(projectedPoint);
			}

			if (followCamera()) {
				worldPlanePosition.value.set(0, 0, 0).applyMatrix4(mesh.matrixWorld);
			}
		},
		{
			autoInvalidate: false,
			running: () => followCamera() || !$$props.fadeOrigin
		}
	);

	T($$anchor, $.spread_props(
		{
			get is() {
				return mesh;
			},
			frustumCulled: false
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
				var fragment_1 = root();
				var node = $.first_child(fragment_1);

				$.component(node, () => T.ShaderMaterial, ($$anchor, T_ShaderMaterial) => {
					T_ShaderMaterial($$anchor, {
						get fragmentShader() {
							return fragmentShader;
						},

						get vertexShader() {
							return vertexShader;
						},

						get uniforms() {
							return uniforms;
						},
						transparent: true,
						get side() {
							return side();
						}
					});
				});

				var node_1 = $.sibling(node, 2);

				{
					var consequent = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.snippet(node_2, () => $$props.children, () => ({ ref: mesh }));
						$.append($$anchor, fragment_2);
					};

					var alternate = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_3 = $.first_child(fragment_3);

						{
							let $0 = $.derived(() => typeof gridSize() == 'number' ? [gridSize(), gridSize()] : gridSize());

							$.component(node_3, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
								T_PlaneGeometry($$anchor, {
									get args() {
										return $.get($0);
									}
								});
							});
						}

						$.append($$anchor, fragment_3);
					};

					$.if(node_1, ($$render) => {
						if ($$props.children) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}