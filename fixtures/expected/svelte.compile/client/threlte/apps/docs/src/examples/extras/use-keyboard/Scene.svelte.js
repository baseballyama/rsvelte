import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Edges, HTML, Text, useKeyboard } from '@threlte/extras';
import { fade } from 'svelte/transition';
import { Spring } from 'svelte/motion';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<span class="badge just-pressed svelte-dlnivw"> </span>`);
var root_3 = $.from_html(`<span class="badge just-released svelte-dlnivw"> </span>`);
var root_4 = $.from_html(`<div class="states svelte-dlnivw"></div>`);
var root_5 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const keyboard = useKeyboard();
	const w = keyboard.key('w');
	const a = keyboard.key('a');
	const s = keyboard.key('s');
	const d = keyboard.key('d');
	const space = keyboard.key('Space');

	const trackedKeys = [
		{ key: w, label: 'W' },
		{ key: a, label: 'A' },
		{ key: s, label: 'S' },
		{ key: d, label: 'D' },
		{ key: space, label: 'Space' }
	];

	const activeColor = '#ff3e00';
	const inactiveColor = '#1a1a1a';
	const activeTextColor = 'white';
	const inactiveTextColor = '#aaaaaa';
	const edgeColor = 'rgba(255, 255, 255, 0.2)';
	const activeEdgeColor = '#ff3e00';
	const dep = -0.1;
	const springOpts = { stiffness: 0.3, damping: 0.6 };
	const wZ = Spring.of(() => w.pressed ? dep : 0, springOpts);
	const aZ = Spring.of(() => a.pressed ? dep : 0, springOpts);
	const sZ = Spring.of(() => s.pressed ? dep : 0, springOpts);
	const dZ = Spring.of(() => d.pressed ? dep : 0, springOpts);
	const spaceZ = Spring.of(() => space.pressed ? dep : 0, springOpts);
	var fragment = root_5();
	var node = $.first_child(fragment);

	$.component(node, () => T.OrthographicCamera, ($$anchor, T_OrthographicCamera) => {
		T_OrthographicCamera($$anchor, {
			zoom: 90,
			position: [5, 5, 8],
			makeDefault: true,
			oncreate: (ref) => {
				ref.lookAt(0, 0, 0);
			}
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.6 });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [5, 5, 5], intensity: 0.8 });
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			'position.x': 0,
			'position.y': 1.15,
			get 'position.z'() {
				return wZ.current;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_4 = $.first_child(fragment_1);

				$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh) => {
					T_Mesh($$anchor, {
						'scale.y': 0.9,
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_5 = $.first_child(fragment_2);

							$.component(node_5, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
								T_BoxGeometry($$anchor, { args: [1, 1, 0.3] });
							});

							var node_6 = $.sibling(node_5, 2);

							{
								let $0 = $.derived(() => w.pressed ? activeColor : inactiveColor);

								$.component(node_6, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
									T_MeshStandardMaterial($$anchor, {
										get color() {
											return $.get($0);
										}
									});
								});
							}

							var node_7 = $.sibling(node_6, 2);

							{
								let $0 = $.derived(() => w.pressed ? activeEdgeColor : edgeColor);

								Edges(node_7, {
									get color() {
										return $.get($0);
									}
								});
							}

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_8 = $.sibling(node_4, 2);

				{
					let $0 = $.derived(() => w.pressed ? activeTextColor : inactiveTextColor);

					Text(node_8, {
						text: 'W',
						fontSize: 0.4,
						get color() {
							return $.get($0);
						},
						anchorX: 'center',
						anchorY: 'middle',
						'position.z': 0.16
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_9 = $.sibling(node_3, 2);

	$.component(node_9, () => T.Group, ($$anchor, T_Group_1) => {
		T_Group_1($$anchor, {
			'position.x': -1.1,
			'position.y': 0,
			get 'position.z'() {
				return aZ.current;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root_1();
				var node_10 = $.first_child(fragment_3);

				$.component(node_10, () => T.Mesh, ($$anchor, T_Mesh_1) => {
					T_Mesh_1($$anchor, {
						'scale.y': 0.9,
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root();
							var node_11 = $.first_child(fragment_4);

							$.component(node_11, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_1) => {
								T_BoxGeometry_1($$anchor, { args: [1, 1, 0.3] });
							});

							var node_12 = $.sibling(node_11, 2);

							{
								let $0 = $.derived(() => a.pressed ? activeColor : inactiveColor);

								$.component(node_12, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
									T_MeshStandardMaterial_1($$anchor, {
										get color() {
											return $.get($0);
										}
									});
								});
							}

							var node_13 = $.sibling(node_12, 2);

							{
								let $0 = $.derived(() => a.pressed ? activeEdgeColor : edgeColor);

								Edges(node_13, {
									get color() {
										return $.get($0);
									}
								});
							}

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				var node_14 = $.sibling(node_10, 2);

				{
					let $0 = $.derived(() => a.pressed ? activeTextColor : inactiveTextColor);

					Text(node_14, {
						text: 'A',
						fontSize: 0.4,
						get color() {
							return $.get($0);
						},
						anchorX: 'center',
						anchorY: 'middle',
						'position.z': 0.16
					});
				}

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	});

	var node_15 = $.sibling(node_9, 2);

	$.component(node_15, () => T.Group, ($$anchor, T_Group_2) => {
		T_Group_2($$anchor, {
			'position.x': 0,
			'position.y': 0,
			get 'position.z'() {
				return sZ.current;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_5 = root_1();
				var node_16 = $.first_child(fragment_5);

				$.component(node_16, () => T.Mesh, ($$anchor, T_Mesh_2) => {
					T_Mesh_2($$anchor, {
						'scale.y': 0.9,
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root();
							var node_17 = $.first_child(fragment_6);

							$.component(node_17, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_2) => {
								T_BoxGeometry_2($$anchor, { args: [1, 1, 0.3] });
							});

							var node_18 = $.sibling(node_17, 2);

							{
								let $0 = $.derived(() => s.pressed ? activeColor : inactiveColor);

								$.component(node_18, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_2) => {
									T_MeshStandardMaterial_2($$anchor, {
										get color() {
											return $.get($0);
										}
									});
								});
							}

							var node_19 = $.sibling(node_18, 2);

							{
								let $0 = $.derived(() => s.pressed ? activeEdgeColor : edgeColor);

								Edges(node_19, {
									get color() {
										return $.get($0);
									}
								});
							}

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				var node_20 = $.sibling(node_16, 2);

				{
					let $0 = $.derived(() => s.pressed ? activeTextColor : inactiveTextColor);

					Text(node_20, {
						text: 'S',
						fontSize: 0.4,
						get color() {
							return $.get($0);
						},
						anchorX: 'center',
						anchorY: 'middle',
						'position.z': 0.16
					});
				}

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	});

	var node_21 = $.sibling(node_15, 2);

	$.component(node_21, () => T.Group, ($$anchor, T_Group_3) => {
		T_Group_3($$anchor, {
			'position.x': 1.1,
			'position.y': 0,
			get 'position.z'() {
				return dZ.current;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_7 = root_1();
				var node_22 = $.first_child(fragment_7);

				$.component(node_22, () => T.Mesh, ($$anchor, T_Mesh_3) => {
					T_Mesh_3($$anchor, {
						'scale.y': 0.9,
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root();
							var node_23 = $.first_child(fragment_8);

							$.component(node_23, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_3) => {
								T_BoxGeometry_3($$anchor, { args: [1, 1, 0.3] });
							});

							var node_24 = $.sibling(node_23, 2);

							{
								let $0 = $.derived(() => d.pressed ? activeColor : inactiveColor);

								$.component(node_24, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_3) => {
									T_MeshStandardMaterial_3($$anchor, {
										get color() {
											return $.get($0);
										}
									});
								});
							}

							var node_25 = $.sibling(node_24, 2);

							{
								let $0 = $.derived(() => d.pressed ? activeEdgeColor : edgeColor);

								Edges(node_25, {
									get color() {
										return $.get($0);
									}
								});
							}

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				});

				var node_26 = $.sibling(node_22, 2);

				{
					let $0 = $.derived(() => d.pressed ? activeTextColor : inactiveTextColor);

					Text(node_26, {
						text: 'D',
						fontSize: 0.4,
						get color() {
							return $.get($0);
						},
						anchorX: 'center',
						anchorY: 'middle',
						'position.z': 0.16
					});
				}

				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		});
	});

	var node_27 = $.sibling(node_21, 2);

	$.component(node_27, () => T.Group, ($$anchor, T_Group_4) => {
		T_Group_4($$anchor, {
			'position.x': 0,
			'position.y': -1.15,
			get 'position.z'() {
				return spaceZ.current;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_9 = root_1();
				var node_28 = $.first_child(fragment_9);

				$.component(node_28, () => T.Mesh, ($$anchor, T_Mesh_4) => {
					T_Mesh_4($$anchor, {
						'scale.y': 0.9,
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = root();
							var node_29 = $.first_child(fragment_10);

							$.component(node_29, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_4) => {
								T_BoxGeometry_4($$anchor, { args: [3.2, 1, 0.3] });
							});

							var node_30 = $.sibling(node_29, 2);

							{
								let $0 = $.derived(() => space.pressed ? activeColor : inactiveColor);

								$.component(node_30, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_4) => {
									T_MeshStandardMaterial_4($$anchor, {
										get color() {
											return $.get($0);
										}
									});
								});
							}

							var node_31 = $.sibling(node_30, 2);

							{
								let $0 = $.derived(() => space.pressed ? activeEdgeColor : edgeColor);

								Edges(node_31, {
									get color() {
										return $.get($0);
									}
								});
							}

							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});
				});

				var node_32 = $.sibling(node_28, 2);

				{
					let $0 = $.derived(() => space.pressed ? activeTextColor : inactiveTextColor);

					Text(node_32, {
						text: 'Space',
						fontSize: 0.35,
						get color() {
							return $.get($0);
						},
						anchorX: 'center',
						anchorY: 'middle',
						'position.z': 0.16
					});
				}

				$.append($$anchor, fragment_9);
			},
			$$slots: { default: true }
		});
	});

	var node_33 = $.sibling(node_27, 2);

	Text(node_33, {
		text: 'Press WASD or Space',
		fontSize: 0.25,
		color: '#666666',
		anchorX: 'center',
		anchorY: 'middle',
		position: [0, 2.4, 0]
	});

	var node_34 = $.sibling(node_33, 2);

	$.component(node_34, () => T.Group, ($$anchor, T_Group_5) => {
		T_Group_5($$anchor, {
			position: [0, -2.4, 0],
			children: ($$anchor, $$slotProps) => {
				HTML($$anchor, {
					center: true,
					transform: false,
					children: ($$anchor, $$slotProps) => {
						var div = root_4();

						$.each(div, 21, () => trackedKeys, $.index, ($$anchor, $$item) => {
							let key = () => $.get($$item).key;
							let label = () => $.get($$item).label;
							var fragment_12 = $.comment();
							var node_35 = $.first_child(fragment_12);

							{
								var consequent = ($$anchor) => {
									var span = root_2();
									var text = $.only_child(span);

									$.template_effect(() => $.set_text(text, `${label() ?? ''} justPressed`));
									$.transition(2, span, () => fade, () => ({ duration: 400 }));
									$.append($$anchor, span);
								};

								var consequent_1 = ($$anchor) => {
									var span_1 = root_3();
									var text_1 = $.only_child(span_1);

									$.template_effect(() => $.set_text(text_1, `${label() ?? ''} justReleased`));
									$.transition(2, span_1, () => fade, () => ({ duration: 400 }));
									$.append($$anchor, span_1);
								};

								$.if(node_35, ($$render) => {
									if (key().justPressed) $$render(consequent); else if (key().justReleased) $$render(consequent_1, 1);
								});
							}

							$.append($$anchor, fragment_12);
						});

						$.reset(div);
						$.append($$anchor, div);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}