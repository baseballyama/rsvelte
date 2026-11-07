import * as $ from 'svelte/internal/server';
import { DoubleSide } from 'three';
import { RadialGradientTexture, OrbitControls } from '@threlte/extras';
import { T, useThrelte } from '@threlte/core';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			canvasSize,
			gradientInnerRadius,
			gradientOuterRadius,
			gradientEndColor,
			gradientStartColor,
			sceneClearColor,
			textureCenterX,
			textureCenterY,
			textureOffsetX,
			textureOffsetY,
			textureRepeatX,
			textureRepeatY,
			textureRotation,
			textureWrapS,
			textureWrapT
		} = $$props;

		let stops = $.derived(() => [
			{ color: gradientStartColor, offset: 0 },
			{ color: gradientEndColor, offset: 1 }
		]);

		const { invalidate, renderer } = useThrelte();

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				'position.z': 5,
				children: ($$renderer) => {
					OrbitControls($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				scale: 2,
				children: ($$renderer) => {
					if (T.PlaneGeometry) {
						$$renderer.push('<!--[-->');
						T.PlaneGeometry($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshBasicMaterial) {
						$$renderer.push('<!--[-->');

						T.MeshBasicMaterial($$renderer, {
							side: DoubleSide,
							children: ($$renderer) => {
								RadialGradientTexture($$renderer, {
									width: canvasSize,
									height: canvasSize,
									innerRadius: gradientInnerRadius,
									outerRadius: gradientOuterRadius,
									'center.x': textureCenterX,
									'center.y': textureCenterY,
									'offset.x': textureOffsetX,
									'offset.y': textureOffsetY,
									'repeat.x': textureRepeatX,
									'repeat.y': textureRepeatY,
									rotation: textureRotation,
									wrapS: textureWrapS,
									wrapT: textureWrapT,
									stops: stops()
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
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