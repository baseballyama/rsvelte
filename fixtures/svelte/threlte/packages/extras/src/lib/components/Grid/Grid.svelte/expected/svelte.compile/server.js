import * as $ from 'svelte/internal/server';
import { isInstanceOf, T, useTask, useThrelte } from '@threlte/core';
import { Color, DoubleSide, Plane, Uniform, Vector3, Mesh } from 'three';
import { fragmentShader, vertexShader } from './gridShaders.js';

export default function Grid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			cellSize = 1,
			sectionSize = 10,
			cellColor = '#000000',
			sectionColor = '#0000ee',
			backgroundColor = '#dadada',
			backgroundOpacity = 0,
			fadeDistance = 100,
			fadeStrength = 1,
			cellThickness = 1,
			sectionThickness = 2,
			plane = 'xz',
			gridSize = [20, 20],
			followCamera = false,
			infiniteGrid = false,
			fadeOrigin,
			side = DoubleSide,
			type = 'grid',
			axis = 'x',
			maxRadius = 0,
			cellDividers = 6,
			sectionDividers = 2,
			ref = void 0,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

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

		// convert axis string to int indexes xzy = [0,2,1]
		useTask(
			() => {
				gridPlane.setFromNormalAndCoplanarPoint(gridPlaneNormal, zeroVector).applyMatrix4(mesh.matrixWorld);

				const material = mesh.material;
				const worldCamProjPosition = material.uniforms.worldCamProjPosition;
				const worldPlanePosition = material.uniforms.worldPlanePosition;
				const uFadeOrigin = material.uniforms.fadeOrigin;
				const projectedPoint = gridPlane.projectPoint(camera.current.position, worldCamProjPosition.value);

				if (!fadeOrigin) {
					uFadeOrigin.value.copy(projectedPoint);
				}

				if (followCamera) {
					worldPlanePosition.value.set(0, 0, 0).applyMatrix4(mesh.matrixWorld);
				}
			},
			{
				autoInvalidate: false,
				running: () => followCamera || !fadeOrigin
			}
		);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: mesh, frustumCulled: false },
				props,
				{
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (T.ShaderMaterial) {
							$$renderer.push('<!--[-->');

							T.ShaderMaterial($$renderer, {
								fragmentShader,
								vertexShader,
								uniforms,
								transparent: true,
								side
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (children) {
							$$renderer.push('<!--[0-->');
							children($$renderer, { ref: mesh });
							$$renderer.push(`<!---->`);
						} else {
							$$renderer.push('<!--[-1-->');

							if (T.PlaneGeometry) {
								$$renderer.push('<!--[-->');

								T.PlaneGeometry($$renderer, {
									args: typeof gridSize == 'number' ? [gridSize, gridSize] : gridSize
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}