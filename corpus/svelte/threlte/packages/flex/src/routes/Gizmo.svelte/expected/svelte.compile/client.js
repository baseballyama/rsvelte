import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { DEG2RAD } from 'three/src/math/MathUtils.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Gizmo($$anchor, $$props) {
	let size = $.prop($$props, 'size', 3, 1),
		thickness = $.prop($$props, 'thickness', 3, 0.02),
		arrows = $.prop($$props, 'arrows', 3, false),
		hideX = $.prop($$props, 'hideX', 3, false),
		hideY = $.prop($$props, 'hideY', 3, false),
		hideZ = $.prop($$props, 'hideZ', 3, false);

	let showAny = $.derived(() => !hideX() || !hideY() || !hideZ());
	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
				T_Mesh($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => [thickness() * 2]);

							$.component(node_2, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
								T_SphereGeometry($$anchor, {
									get args() {
										return $.get($0);
									}
								});
							});
						}

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
							T_MeshBasicMaterial($$anchor, { color: 'white' });
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(showAny)) $$render(consequent);
		});
	}

	var node_4 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_5 = $.first_child(fragment_3);

			{
				let $0 = $.derived(() => size() / 2);

				$.component(node_5, () => T.Mesh, ($$anchor, T_Mesh_1) => {
					T_Mesh_1($$anchor, {
						get 'position.x'() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_1();
							var node_6 = $.first_child(fragment_4);

							{
								let $0 = $.derived(() => [thickness(), thickness(), size()]);

								$.component(node_6, () => T.CylinderGeometry, ($$anchor, T_CylinderGeometry) => {
									T_CylinderGeometry($$anchor, {
										get args() {
											return $.get($0);
										},

										oncreate: (ref) => {
											ref.rotateZ(90 * DEG2RAD);
										}
									});
								});
							}

							var node_7 = $.sibling(node_6, 2);

							$.component(node_7, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_1) => {
								T_MeshBasicMaterial_1($$anchor, { color: 'red' });
							});

							var node_8 = $.sibling(node_7, 2);

							{
								var consequent_1 = ($$anchor) => {
									var fragment_5 = $.comment();
									var node_9 = $.first_child(fragment_5);

									{
										let $0 = $.derived(() => size() / 2 + thickness() * 3);

										$.component(node_9, () => T.Mesh, ($$anchor, T_Mesh_2) => {
											T_Mesh_2($$anchor, {
												get 'position.x'() {
													return $.get($0);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root();
													var node_10 = $.first_child(fragment_6);

													{
														let $0 = $.derived(() => [thickness() * 3, thickness() * 6]);

														$.component(node_10, () => T.ConeGeometry, ($$anchor, T_ConeGeometry) => {
															T_ConeGeometry($$anchor, {
																get args() {
																	return $.get($0);
																},

																oncreate: (ref) => {
																	ref.rotateZ(-90 * DEG2RAD);
																}
															});
														});
													}

													var node_11 = $.sibling(node_10, 2);

													$.component(node_11, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_2) => {
														T_MeshBasicMaterial_2($$anchor, { color: 'red' });
													});

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});
									}

									$.append($$anchor, fragment_5);
								};

								$.if(node_8, ($$render) => {
									if (arrows()) $$render(consequent_1);
								});
							}

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_3);
		};

		$.if(node_4, ($$render) => {
			if (!hideX()) $$render(consequent_2);
		});
	}

	var node_12 = $.sibling(node_4, 2);

	{
		var consequent_4 = ($$anchor) => {
			var fragment_7 = $.comment();
			var node_13 = $.first_child(fragment_7);

			{
				let $0 = $.derived(() => size() / 2);

				$.component(node_13, () => T.Mesh, ($$anchor, T_Mesh_3) => {
					T_Mesh_3($$anchor, {
						get 'position.y'() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root_1();
							var node_14 = $.first_child(fragment_8);

							{
								let $0 = $.derived(() => [thickness(), thickness(), size()]);

								$.component(node_14, () => T.CylinderGeometry, ($$anchor, T_CylinderGeometry_1) => {
									T_CylinderGeometry_1($$anchor, {
										get args() {
											return $.get($0);
										}
									});
								});
							}

							var node_15 = $.sibling(node_14, 2);

							$.component(node_15, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_3) => {
								T_MeshBasicMaterial_3($$anchor, { color: 'green' });
							});

							var node_16 = $.sibling(node_15, 2);

							{
								var consequent_3 = ($$anchor) => {
									var fragment_9 = $.comment();
									var node_17 = $.first_child(fragment_9);

									{
										let $0 = $.derived(() => size() / 2 + thickness() * 3);

										$.component(node_17, () => T.Mesh, ($$anchor, T_Mesh_4) => {
											T_Mesh_4($$anchor, {
												get 'position.y'() {
													return $.get($0);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_10 = root();
													var node_18 = $.first_child(fragment_10);

													{
														let $0 = $.derived(() => [thickness() * 3, thickness() * 6]);

														$.component(node_18, () => T.ConeGeometry, ($$anchor, T_ConeGeometry_1) => {
															T_ConeGeometry_1($$anchor, {
																get args() {
																	return $.get($0);
																}
															});
														});
													}

													var node_19 = $.sibling(node_18, 2);

													$.component(node_19, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_4) => {
														T_MeshBasicMaterial_4($$anchor, { color: 'green' });
													});

													$.append($$anchor, fragment_10);
												},
												$$slots: { default: true }
											});
										});
									}

									$.append($$anchor, fragment_9);
								};

								$.if(node_16, ($$render) => {
									if (arrows()) $$render(consequent_3);
								});
							}

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_7);
		};

		$.if(node_12, ($$render) => {
			if (!hideY()) $$render(consequent_4);
		});
	}

	var node_20 = $.sibling(node_12, 2);

	{
		var consequent_6 = ($$anchor) => {
			var fragment_11 = $.comment();
			var node_21 = $.first_child(fragment_11);

			{
				let $0 = $.derived(() => size() / 2);

				$.component(node_21, () => T.Mesh, ($$anchor, T_Mesh_5) => {
					T_Mesh_5($$anchor, {
						get 'position.z'() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_12 = root_1();
							var node_22 = $.first_child(fragment_12);

							{
								let $0 = $.derived(() => [thickness(), thickness(), size()]);

								$.component(node_22, () => T.CylinderGeometry, ($$anchor, T_CylinderGeometry_2) => {
									T_CylinderGeometry_2($$anchor, {
										get args() {
											return $.get($0);
										},

										oncreate: (ref) => {
											ref.rotateX(90 * DEG2RAD);
										}
									});
								});
							}

							var node_23 = $.sibling(node_22, 2);

							$.component(node_23, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_5) => {
								T_MeshBasicMaterial_5($$anchor, { color: 'blue' });
							});

							var node_24 = $.sibling(node_23, 2);

							{
								var consequent_5 = ($$anchor) => {
									var fragment_13 = $.comment();
									var node_25 = $.first_child(fragment_13);

									{
										let $0 = $.derived(() => size() / 2 + thickness() * 3);

										$.component(node_25, () => T.Mesh, ($$anchor, T_Mesh_6) => {
											T_Mesh_6($$anchor, {
												get 'position.z'() {
													return $.get($0);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_14 = root();
													var node_26 = $.first_child(fragment_14);

													{
														let $0 = $.derived(() => [thickness() * 3, thickness() * 6]);

														$.component(node_26, () => T.ConeGeometry, ($$anchor, T_ConeGeometry_2) => {
															T_ConeGeometry_2($$anchor, {
																get args() {
																	return $.get($0);
																},

																oncreate: (ref) => {
																	ref.rotateX(90 * DEG2RAD);
																}
															});
														});
													}

													var node_27 = $.sibling(node_26, 2);

													$.component(node_27, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_6) => {
														T_MeshBasicMaterial_6($$anchor, { color: 'blue' });
													});

													$.append($$anchor, fragment_14);
												},
												$$slots: { default: true }
											});
										});
									}

									$.append($$anchor, fragment_13);
								};

								$.if(node_24, ($$render) => {
									if (arrows()) $$render(consequent_5);
								});
							}

							$.append($$anchor, fragment_12);
						},
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_11);
		};

		$.if(node_20, ($$render) => {
			if (!hideZ()) $$render(consequent_6);
		});
	}

	$.append($$anchor, fragment);
}