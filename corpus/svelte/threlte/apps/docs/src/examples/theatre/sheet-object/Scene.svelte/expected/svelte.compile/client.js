import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MathUtils } from 'three';
import { T } from '@threlte/core';
import { RoundedBoxGeometry, interactivity, useCursor } from '@threlte/extras';
import { SheetObject } from '@threlte/theatre';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);
	interactivity();

	const { onPointerEnter, onPointerLeave } = useCursor();
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let Sync = () => ($$arg0?.()).Sync;
			let Transform = () => ($$arg0?.()).Transform;
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, Transform, ($$anchor, Transform_1) => {
				Transform_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
							T_DirectionalLight($$anchor, {
								castShadow: true,
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, Sync, ($$anchor, Sync_1) => {
										Sync_1($$anchor, { intensity: true, color: true });
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		SheetObject(node, {
			key: 'Directional Light',
			children,
			$$slots: { default: true }
		});
	}

	var node_4 = $.sibling(node, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let Sync = () => ($$arg0?.()).Sync;
			var fragment_4 = $.comment();
			var node_5 = $.first_child(fragment_4);

			$.component(node_5, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
				T_AmbientLight($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = $.comment();
						var node_6 = $.first_child(fragment_5);

						$.component(node_6, Sync, ($$anchor, Sync_2) => {
							Sync_2($$anchor, { intensity: true, color: true });
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_4);
		};

		SheetObject(node_4, { key: 'Ambient Light', children, $$slots: { default: true } });
	}

	var node_7 = $.sibling(node_4, 2);

	$.component(node_7, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [5, 5, 5],
			oncreate: (ref) => {
				ref.lookAt(0, 0, 0);
			}
		});
	});

	var node_8 = $.sibling(node_7, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let Sync = () => ($$arg0?.()).Sync;
			let Transform = () => ($$arg0?.()).Transform;
			let select = () => ($$arg0?.()).select;
			let deselect = () => ($$arg0?.()).deselect;
			var fragment_6 = $.comment();
			var node_9 = $.first_child(fragment_6);

			$.component(node_9, Transform, ($$anchor, Transform_2) => {
				Transform_2($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = $.comment();
						var node_10 = $.first_child(fragment_7);

						$.component(node_10, () => T.Mesh, ($$anchor, T_Mesh) => {
							T_Mesh($$anchor, {
								castShadow: true,
								get onclick() {
									return select();
								},

								get onpointerenter() {
									return onPointerEnter;
								},

								get onpointerleave() {
									return onPointerLeave;
								},

								get onpointermissed() {
									return deselect();
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root();
									var node_11 = $.first_child(fragment_8);

									RoundedBoxGeometry(node_11, { radius: 0.1 });

									var node_12 = $.sibling(node_11, 2);

									{
										const children = ($$anchor, $$arg0) => {
											let ref = () => ($$arg0?.()).ref;
											var fragment_9 = $.comment();
											var node_13 = $.first_child(fragment_9);

											$.component(node_13, Sync, ($$anchor, Sync_3) => {
												Sync_3($$anchor, {
													get type() {
														return ref();
													},
													color: true,
													roughness: true,
													metalness: true,
													side: true,
													opacity: true
												});
											});

											$.append($$anchor, fragment_9);
										};

										$.component(node_12, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
											T_MeshStandardMaterial($$anchor, { transparent: true, children, $$slots: { default: true } });
										});
									}

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_6);
		};

		SheetObject(node_8, { key: 'Box', children, $$slots: { default: true } });
	}

	var node_14 = $.sibling(node_8, 2);

	{
		let $0 = $.derived(() => -90 * MathUtils.DEG2RAD);

		$.component(node_14, () => T.Mesh, ($$anchor, T_Mesh_1) => {
			T_Mesh_1($$anchor, {
				receiveShadow: true,
				'position.y': -1,
				get 'rotation.x'() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root();
					var node_15 = $.first_child(fragment_10);

					$.component(node_15, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
						T_CircleGeometry($$anchor, { args: [1.4, 48] });
					});

					var node_16 = $.sibling(node_15, 2);

					$.component(node_16, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
						T_MeshStandardMaterial_1($$anchor, {});
					});

					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}