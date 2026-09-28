import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Mesh, MeshPhongMaterial, CylinderGeometry } from 'three';
import { T } from '@threlte/core';
import { XR, Controller, Hand, useHitTest } from '@threlte/xr';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const geometry = new CylinderGeometry(0.1, 0.1, 0.2, 32).translate(0, 0.1, 0);
	let meshes = $.proxy([]);
	let cursors = { left: new Mesh(), right: new Mesh() };
	const hands = ['left', 'right'];

	const handleSelect = (hand) => {
		return () => {
			if (!cursors[hand].visible) return;

			const material = new MeshPhongMaterial({ color: 0xffffff * Math.random() });
			const mesh = new Mesh(geometry, material);

			cursors[hand].matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
			mesh.scale.y = Math.random() * 2 + 1;
			meshes.push(mesh);
		};
	};

	const handleHitTest = (hand) => {
		return (hitMatrix, hit) => {
			if (hit) {
				cursors[hand].visible = true;
				cursors[hand].matrix.copy(hitMatrix);
			} else {
				cursors[hand].visible = false;
			}
		};
	};

	useHitTest(handleHitTest('left'), { source: 'leftInput' });
	useHitTest(handleHitTest('right'), { source: 'rightInput' });

	var fragment = root_1();
	var node = $.first_child(fragment);

	XR(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => hands, $.index, ($$anchor, hand) => {
				var fragment_2 = root();
				var node_2 = $.first_child(fragment_2);

				{
					let $0 = $.derived(() => handleSelect($.get(hand)));

					Controller(node_2, {
						get hand() {
							return $.get(hand);
						},

						get onselect() {
							return $.get($0);
						}
					});
				}

				var node_3 = $.sibling(node_2, 2);

				{
					let $0 = $.derived(() => handleSelect($.get(hand)));

					Hand(node_3, {
						get hand() {
							return $.get(hand);
						},

						get onpinchend() {
							return $.get($0);
						}
					});
				}

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	T(node_4, {
		get is() {
			return cursors.left;
		},
		matrixAutoUpdate: false,
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_5 = $.first_child(fragment_3);

			$.component(node_5, () => T.RingGeometry, ($$anchor, T_RingGeometry) => {
				T_RingGeometry($$anchor, {
					args: [0.15, 0.2, 32],
					oncreate: (ref) => {
						ref.rotateX(-Math.PI / 2);
					}
				});
			});

			var node_6 = $.sibling(node_5, 2);

			$.component(node_6, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
				T_MeshBasicMaterial($$anchor, {});
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_4, 2);

	T(node_7, {
		get is() {
			return cursors.right;
		},
		matrixAutoUpdate: false,
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_8 = $.first_child(fragment_4);

			$.component(node_8, () => T.RingGeometry, ($$anchor, T_RingGeometry_1) => {
				T_RingGeometry_1($$anchor, {
					args: [0.15, 0.2, 32],
					oncreate: (ref) => {
						ref.rotateX(-Math.PI / 2);
					}
				});
			});

			var node_9 = $.sibling(node_8, 2);

			$.component(node_9, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_1) => {
				T_MeshBasicMaterial_1($$anchor, {});
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_7, 2);

	$.component(node_10, () => T.HemisphereLight, ($$anchor, T_HemisphereLight) => {
		T_HemisphereLight($$anchor, { args: [0xffffff, 0xbbbbff, 1], position: [0.5, 1, 0.25] });
	});

	var node_11 = $.sibling(node_10, 2);

	$.component(node_11, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.5 });
	});

	var node_12 = $.sibling(node_11, 2);

	$.each(node_12, 16, () => meshes, (mesh) => mesh, ($$anchor, mesh) => {
		T($$anchor, {
			get is() {
				return mesh;
			}
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}