import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { BufferGeometry, DoubleSide, Texture } from 'three';

export default function Mesh($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			get geometry() {
				return $$props.geometry;
			},

			get visible() {
				return $$props.visible;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
					T_MeshBasicMaterial($$anchor, {
						get wireframe() {
							return $$props.wireframe;
						},

						get side() {
							return DoubleSide;
						},

						children: ($$anchor, $$slotProps) => {
							T($$anchor, {
								get is() {
									return $$props.texture;
								},
								attach: 'map',
								flipY: false
							});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}