import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DoubleSide } from 'three';
import { RadialGradientTexture, OrbitControls } from '@threlte/extras';
import { T, useThrelte } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let stops = $.derived(() => [
		{ color: $$props.gradientStartColor, offset: 0 },
		{ color: $$props.gradientEndColor, offset: 1 }
	]);

	const { invalidate, renderer } = useThrelte();

	$.user_effect(() => {
		renderer.setClearColor($$props.sceneClearColor);
		invalidate();
	});

	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			'position.z': 5,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {});
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			scale: 2,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_2 = $.first_child(fragment_2);

				$.component(node_2, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
					T_PlaneGeometry($$anchor, {});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
					T_MeshBasicMaterial($$anchor, {
						get side() {
							return DoubleSide;
						},

						children: ($$anchor, $$slotProps) => {
							RadialGradientTexture($$anchor, {
								get width() {
									return $$props.canvasSize;
								},

								get height() {
									return $$props.canvasSize;
								},

								get innerRadius() {
									return $$props.gradientInnerRadius;
								},

								get outerRadius() {
									return $$props.gradientOuterRadius;
								},

								get 'center.x'() {
									return $$props.textureCenterX;
								},

								get 'center.y'() {
									return $$props.textureCenterY;
								},

								get 'offset.x'() {
									return $$props.textureOffsetX;
								},

								get 'offset.y'() {
									return $$props.textureOffsetY;
								},

								get 'repeat.x'() {
									return $$props.textureRepeatX;
								},

								get 'repeat.y'() {
									return $$props.textureRepeatY;
								},

								get rotation() {
									return $$props.textureRotation;
								},

								get wrapS() {
									return $$props.textureWrapS;
								},

								get wrapT() {
									return $$props.textureWrapT;
								},

								get stops() {
									return $.get(stops);
								}
							});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}