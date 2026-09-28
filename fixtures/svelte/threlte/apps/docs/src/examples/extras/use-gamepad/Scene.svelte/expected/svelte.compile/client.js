import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Edges, HTML, Text, useGamepad, useTexture } from '@threlte/extras';
import { fly } from 'svelte/transition';
import { Spring } from 'svelte/motion';
import { Color } from 'three';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<span class="badge just-pressed svelte-d7uj6m"> </span>`);
var root_4 = $.from_html(`<span class="badge just-released svelte-d7uj6m"> </span>`);
var root_5 = $.from_html(`<div class="states svelte-d7uj6m"></div>`);
var root_6 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $logo = () => $.store_get(logo, '$logo', $$stores);
	const $connected = () => $.store_get(connected, '$connected', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let gamepadRef = $.prop($$props, 'gamepadRef', 15);
	const gamepad = useGamepad();

	gamepadRef(gamepad);

	const { connected } = gamepad;
	const logo = useTexture('/icons/mstile-150x150.png');

	// Buttons and sticks via the new API
	const dUp = gamepad.button('directionalTop');

	const dDown = gamepad.button('directionalBottom');
	const dLeft = gamepad.button('directionalLeft');
	const dRight = gamepad.button('directionalRight');
	const btnA = gamepad.button('clusterBottom');
	const btnB = gamepad.button('clusterRight');
	const btnX = gamepad.button('clusterLeft');
	const btnY = gamepad.button('clusterTop');
	const lt = gamepad.button('leftTrigger');
	const rt = gamepad.button('rightTrigger');
	const sel = gamepad.button('select');
	const btnStart = gamepad.button('start');
	const bodyColor = '#eedbcb';
	const buttonColor = '#111111';
	const activeColor = '#ff3e00';
	const triggerColor = '#555555';
	const activeTextColor = 'white';
	const dep = -0.06;
	const springOpts = { stiffness: 0.3, damping: 0.6 };

	// D-pad springs
	const dUpZ = Spring.of(() => dUp.pressed ? dep : 0, springOpts);

	const dDownZ = Spring.of(() => dDown.pressed ? dep : 0, springOpts);
	const dLeftZ = Spring.of(() => dLeft.pressed ? dep : 0, springOpts);
	const dRightZ = Spring.of(() => dRight.pressed ? dep : 0, springOpts);

	// Action button springs
	const aZ = Spring.of(() => btnA.pressed ? dep : 0, springOpts);

	const bZ = Spring.of(() => btnB.pressed ? dep : 0, springOpts);
	const xZ = Spring.of(() => btnX.pressed ? dep : 0, springOpts);
	const yZ = Spring.of(() => btnY.pressed ? dep : 0, springOpts);

	// Center button springs
	const selZ = Spring.of(() => sel.pressed ? dep : 0, springOpts);

	const startZ = Spring.of(() => btnStart.pressed ? dep : 0, springOpts);

	const trackedButtons = [
		{ state: btnA, label: 'A' },
		{ state: btnB, label: 'B' },
		{ state: btnX, label: 'X' },
		{ state: btnY, label: 'Y' },
		{ state: lt, label: 'LT' },
		{ state: rt, label: 'RT' },
		{ state: dUp, label: 'Up' },
		{ state: dDown, label: 'Down' },
		{ state: dLeft, label: 'Left' },
		{ state: dRight, label: 'Right' },
		{ state: sel, label: 'Select' },
		{ state: btnStart, label: 'Start' }
	];

	// Layout
	const dpadX = -2;

	const clusterX = 2;
	const padY = 0;
	const s = 0.6;
	const bh = 0.25;
	const bodyDepth = 0.8;
	const front = bodyDepth / 2 + bh / 2;
	const top = 1.5;
	const textZ = bh / 2 + 0.01;
	const color1 = new Color();
	const color2 = new Color();
	var fragment = root_6();
	var node = $.first_child(fragment);

	$.component(node, () => T.OrthographicCamera, ($$anchor, T_OrthographicCamera) => {
		T_OrthographicCamera($$anchor, {
			zoom: 70,
			position: [7, 5, 8],
			makeDefault: true,
			oncreate: (ref) => ref.lookAt(2, 0, 0)
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.6 });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [3, 5, 5], intensity: 0.8 });
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_4 = $.first_child(fragment_1);

				$.component(node_4, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
					T_BoxGeometry($$anchor, { args: [7, 3, bodyDepth] });
				});

				var node_5 = $.sibling(node_4, 2);

				$.component(node_5, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { color: bodyColor });
				});

				var node_6 = $.sibling(node_5, 2);

				Edges(node_6, { color: 'black', scale: 1.001 });
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_7 = $.sibling(node_3, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_8 = $.first_child(fragment_2);

			$.component(node_8, () => T.Mesh, ($$anchor, T_Mesh_1) => {
				T_Mesh_1($$anchor, {
					position: [0, 0.2, front + 0.01],
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_1();
						var node_9 = $.first_child(fragment_3);

						$.component(node_9, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
							T_PlaneGeometry($$anchor, { args: [1.5, 1.5] });
						});

						var node_10 = $.sibling(node_9, 2);

						$.component(node_10, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
							T_MeshStandardMaterial_1($$anchor, {
								get map() {
									return $logo();
								},
								transparent: true
							});
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_2);
		};

		$.if(node_7, ($$render) => {
			if ($logo()) $$render(consequent);
		});
	}

	var node_11 = $.sibling(node_7, 2);

	{
		let $0 = $.derived(() => [-2.25, top + 0.1 - lt.value * 0.1, 0]);

		$.component(node_11, () => T.Mesh, ($$anchor, T_Mesh_2) => {
			T_Mesh_2($$anchor, {
				get position() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_2();
					var node_12 = $.first_child(fragment_4);

					$.component(node_12, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_1) => {
						T_BoxGeometry_1($$anchor, { args: [1.8, 0.2, 0.5] });
					});

					var node_13 = $.sibling(node_12, 2);

					{
						let $0 = $.derived(() => color1.set(triggerColor).lerp(color2.set(activeColor), lt.value).getHex());

						$.component(node_13, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_2) => {
							T_MeshStandardMaterial_2($$anchor, {
								get color() {
									return $.get($0);
								}
							});
						});
					}

					var node_14 = $.sibling(node_13, 2);

					Edges(node_14, { color: 'black' });

					var node_15 = $.sibling(node_14, 2);

					{
						let $0 = $.derived(() => lt.pressed ? activeTextColor : bodyColor);

						Text(node_15, {
							text: 'LT',
							fontSize: 0.18,
							get color() {
								return $.get($0);
							},
							anchorX: 'center',
							anchorY: 'middle',
							position: [0, 0.11, 0],
							rotation: [-Math.PI / 2, 0, 0]
						});
					}

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_16 = $.sibling(node_11, 2);

	{
		let $0 = $.derived(() => [2.25, top + 0.1 - rt.value * 0.1, 0]);

		$.component(node_16, () => T.Mesh, ($$anchor, T_Mesh_3) => {
			T_Mesh_3($$anchor, {
				get position() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_2();
					var node_17 = $.first_child(fragment_5);

					$.component(node_17, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_2) => {
						T_BoxGeometry_2($$anchor, { args: [1.8, 0.2, 0.5] });
					});

					var node_18 = $.sibling(node_17, 2);

					{
						let $0 = $.derived(() => color1.set(triggerColor).lerp(color2.set(activeColor), rt.value).getHex());

						$.component(node_18, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_3) => {
							T_MeshStandardMaterial_3($$anchor, {
								get color() {
									return $.get($0);
								}
							});
						});
					}

					var node_19 = $.sibling(node_18, 2);

					Edges(node_19, { color: 'black' });

					var node_20 = $.sibling(node_19, 2);

					{
						let $0 = $.derived(() => rt.pressed ? activeTextColor : bodyColor);

						Text(node_20, {
							text: 'RT',
							fontSize: 0.18,
							get color() {
								return $.get($0);
							},
							anchorX: 'center',
							anchorY: 'middle',
							position: [0, 0.11, 0],
							rotation: [-Math.PI / 2, 0, 0]
						});
					}

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_21 = $.sibling(node_16, 2);

	{
		let $0 = $.derived(() => [dpadX, padY + 0.6, front + dUpZ.current]);

		$.component(node_21, () => T.Mesh, ($$anchor, T_Mesh_4) => {
			T_Mesh_4($$anchor, {
				get position() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_2();
					var node_22 = $.first_child(fragment_6);

					$.component(node_22, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_3) => {
						T_BoxGeometry_3($$anchor, { args: [s, s, bh] });
					});

					var node_23 = $.sibling(node_22, 2);

					{
						let $0 = $.derived(() => dUp.touched ? activeColor : buttonColor);

						$.component(node_23, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_4) => {
							T_MeshStandardMaterial_4($$anchor, {
								get color() {
									return $.get($0);
								}
							});
						});
					}

					var node_24 = $.sibling(node_23, 2);

					Edges(node_24, { color: 'black' });

					var node_25 = $.sibling(node_24, 2);

					{
						let $0 = $.derived(() => dUp.pressed ? activeTextColor : bodyColor);

						Text(node_25, {
							text: '\u25B2',
							fontSize: 0.25,
							get color() {
								return $.get($0);
							},
							anchorX: 'center',
							anchorY: 'middle',
							position: [0, 0, textZ]
						});
					}

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_26 = $.sibling(node_21, 2);

	{
		let $0 = $.derived(() => [dpadX, padY - 0.6, front + dDownZ.current]);

		$.component(node_26, () => T.Mesh, ($$anchor, T_Mesh_5) => {
			T_Mesh_5($$anchor, {
				get position() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_2();
					var node_27 = $.first_child(fragment_7);

					$.component(node_27, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_4) => {
						T_BoxGeometry_4($$anchor, { args: [s, s, bh] });
					});

					var node_28 = $.sibling(node_27, 2);

					{
						let $0 = $.derived(() => dDown.pressed ? activeColor : buttonColor);

						$.component(node_28, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_5) => {
							T_MeshStandardMaterial_5($$anchor, {
								get color() {
									return $.get($0);
								}
							});
						});
					}

					var node_29 = $.sibling(node_28, 2);

					Edges(node_29, { color: 'black' });

					var node_30 = $.sibling(node_29, 2);

					{
						let $0 = $.derived(() => dDown.pressed ? activeTextColor : bodyColor);

						Text(node_30, {
							text: '\u25BC',
							fontSize: 0.25,
							get color() {
								return $.get($0);
							},
							anchorX: 'center',
							anchorY: 'middle',
							position: [0, 0, textZ]
						});
					}

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_31 = $.sibling(node_26, 2);

	{
		let $0 = $.derived(() => [dpadX - 0.6, padY, front + dLeftZ.current]);

		$.component(node_31, () => T.Mesh, ($$anchor, T_Mesh_6) => {
			T_Mesh_6($$anchor, {
				get position() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_8 = root_2();
					var node_32 = $.first_child(fragment_8);

					$.component(node_32, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_5) => {
						T_BoxGeometry_5($$anchor, { args: [s, s, bh] });
					});

					var node_33 = $.sibling(node_32, 2);

					{
						let $0 = $.derived(() => dLeft.pressed ? activeColor : buttonColor);

						$.component(node_33, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_6) => {
							T_MeshStandardMaterial_6($$anchor, {
								get color() {
									return $.get($0);
								}
							});
						});
					}

					var node_34 = $.sibling(node_33, 2);

					Edges(node_34, { color: 'black' });

					var node_35 = $.sibling(node_34, 2);

					{
						let $0 = $.derived(() => dLeft.pressed ? activeTextColor : bodyColor);

						Text(node_35, {
							text: '\u25C0',
							fontSize: 0.25,
							get color() {
								return $.get($0);
							},
							anchorX: 'center',
							anchorY: 'middle',
							position: [0, 0, textZ]
						});
					}

					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_36 = $.sibling(node_31, 2);

	{
		let $0 = $.derived(() => [dpadX + 0.6, padY, front + dRightZ.current]);

		$.component(node_36, () => T.Mesh, ($$anchor, T_Mesh_7) => {
			T_Mesh_7($$anchor, {
				get position() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_9 = root_2();
					var node_37 = $.first_child(fragment_9);

					$.component(node_37, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_6) => {
						T_BoxGeometry_6($$anchor, { args: [s, s, bh] });
					});

					var node_38 = $.sibling(node_37, 2);

					{
						let $0 = $.derived(() => dRight.pressed ? activeColor : buttonColor);

						$.component(node_38, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_7) => {
							T_MeshStandardMaterial_7($$anchor, {
								get color() {
									return $.get($0);
								}
							});
						});
					}

					var node_39 = $.sibling(node_38, 2);

					Edges(node_39, { color: 'black' });

					var node_40 = $.sibling(node_39, 2);

					{
						let $0 = $.derived(() => dRight.pressed ? activeTextColor : bodyColor);

						Text(node_40, {
							text: '\u25B6',
							fontSize: 0.25,
							get color() {
								return $.get($0);
							},
							anchorX: 'center',
							anchorY: 'middle',
							position: [0, 0, textZ]
						});
					}

					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_41 = $.sibling(node_36, 2);

	$.component(node_41, () => T.Mesh, ($$anchor, T_Mesh_8) => {
		T_Mesh_8($$anchor, {
			position: [dpadX, padY, front],
			children: ($$anchor, $$slotProps) => {
				var fragment_10 = root_1();
				var node_42 = $.first_child(fragment_10);

				$.component(node_42, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_7) => {
					T_BoxGeometry_7($$anchor, { args: [s, s, bh] });
				});

				var node_43 = $.sibling(node_42, 2);

				$.component(node_43, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_8) => {
					T_MeshStandardMaterial_8($$anchor, { color: buttonColor });
				});

				$.append($$anchor, fragment_10);
			},
			$$slots: { default: true }
		});
	});

	var node_44 = $.sibling(node_41, 2);

	{
		let $0 = $.derived(() => [clusterX, padY - 0.6, front + aZ.current]);

		$.component(node_44, () => T.Mesh, ($$anchor, T_Mesh_9) => {
			T_Mesh_9($$anchor, {
				get position() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_11 = root_2();
					var node_45 = $.first_child(fragment_11);

					$.component(node_45, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_8) => {
						T_BoxGeometry_8($$anchor, { args: [s, s, bh] });
					});

					var node_46 = $.sibling(node_45, 2);

					{
						let $0 = $.derived(() => btnA.pressed ? activeColor : buttonColor);

						$.component(node_46, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_9) => {
							T_MeshStandardMaterial_9($$anchor, {
								get color() {
									return $.get($0);
								}
							});
						});
					}

					var node_47 = $.sibling(node_46, 2);

					Edges(node_47, { color: 'black' });

					var node_48 = $.sibling(node_47, 2);

					{
						let $0 = $.derived(() => btnA.pressed ? activeTextColor : bodyColor);

						Text(node_48, {
							text: 'A',
							fontSize: 0.3,
							get color() {
								return $.get($0);
							},
							anchorX: 'center',
							anchorY: 'middle',
							position: [0, 0, textZ]
						});
					}

					$.append($$anchor, fragment_11);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_49 = $.sibling(node_44, 2);

	{
		let $0 = $.derived(() => [clusterX + 0.65, padY, front + bZ.current]);

		$.component(node_49, () => T.Mesh, ($$anchor, T_Mesh_10) => {
			T_Mesh_10($$anchor, {
				get position() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_12 = root_2();
					var node_50 = $.first_child(fragment_12);

					$.component(node_50, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_9) => {
						T_BoxGeometry_9($$anchor, { args: [s, s, bh] });
					});

					var node_51 = $.sibling(node_50, 2);

					{
						let $0 = $.derived(() => btnB.pressed ? activeColor : buttonColor);

						$.component(node_51, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_10) => {
							T_MeshStandardMaterial_10($$anchor, {
								get color() {
									return $.get($0);
								}
							});
						});
					}

					var node_52 = $.sibling(node_51, 2);

					Edges(node_52, { color: 'black' });

					var node_53 = $.sibling(node_52, 2);

					{
						let $0 = $.derived(() => btnB.pressed ? activeTextColor : bodyColor);

						Text(node_53, {
							text: 'B',
							fontSize: 0.3,
							get color() {
								return $.get($0);
							},
							anchorX: 'center',
							anchorY: 'middle',
							position: [0, 0, textZ]
						});
					}

					$.append($$anchor, fragment_12);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_54 = $.sibling(node_49, 2);

	{
		let $0 = $.derived(() => [clusterX - 0.65, padY, front + xZ.current]);

		$.component(node_54, () => T.Mesh, ($$anchor, T_Mesh_11) => {
			T_Mesh_11($$anchor, {
				get position() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_13 = root_2();
					var node_55 = $.first_child(fragment_13);

					$.component(node_55, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_10) => {
						T_BoxGeometry_10($$anchor, { args: [s, s, bh] });
					});

					var node_56 = $.sibling(node_55, 2);

					{
						let $0 = $.derived(() => btnX.pressed ? activeColor : buttonColor);

						$.component(node_56, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_11) => {
							T_MeshStandardMaterial_11($$anchor, {
								get color() {
									return $.get($0);
								}
							});
						});
					}

					var node_57 = $.sibling(node_56, 2);

					Edges(node_57, { color: 'black' });

					var node_58 = $.sibling(node_57, 2);

					{
						let $0 = $.derived(() => btnX.pressed ? activeTextColor : bodyColor);

						Text(node_58, {
							text: 'X',
							fontSize: 0.3,
							get color() {
								return $.get($0);
							},
							anchorX: 'center',
							anchorY: 'middle',
							position: [0, 0, textZ]
						});
					}

					$.append($$anchor, fragment_13);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_59 = $.sibling(node_54, 2);

	{
		let $0 = $.derived(() => [clusterX, padY + 0.6, front + yZ.current]);

		$.component(node_59, () => T.Mesh, ($$anchor, T_Mesh_12) => {
			T_Mesh_12($$anchor, {
				get position() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_14 = root_2();
					var node_60 = $.first_child(fragment_14);

					$.component(node_60, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_11) => {
						T_BoxGeometry_11($$anchor, { args: [s, s, bh] });
					});

					var node_61 = $.sibling(node_60, 2);

					{
						let $0 = $.derived(() => btnY.pressed ? activeColor : buttonColor);

						$.component(node_61, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_12) => {
							T_MeshStandardMaterial_12($$anchor, {
								get color() {
									return $.get($0);
								}
							});
						});
					}

					var node_62 = $.sibling(node_61, 2);

					Edges(node_62, { color: 'black' });

					var node_63 = $.sibling(node_62, 2);

					{
						let $0 = $.derived(() => btnY.pressed ? activeTextColor : bodyColor);

						Text(node_63, {
							text: 'Y',
							fontSize: 0.3,
							get color() {
								return $.get($0);
							},
							anchorX: 'center',
							anchorY: 'middle',
							position: [0, 0, textZ]
						});
					}

					$.append($$anchor, fragment_14);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_64 = $.sibling(node_59, 2);

	{
		let $0 = $.derived(() => [-0.45, -0.8, front + selZ.current]);

		$.component(node_64, () => T.Mesh, ($$anchor, T_Mesh_13) => {
			T_Mesh_13($$anchor, {
				get position() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_15 = root_2();
					var node_65 = $.first_child(fragment_15);

					$.component(node_65, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_12) => {
						T_BoxGeometry_12($$anchor, { args: [0.7, 0.3, 0.15] });
					});

					var node_66 = $.sibling(node_65, 2);

					{
						let $0 = $.derived(() => sel.pressed ? activeColor : '#888888');

						$.component(node_66, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_13) => {
							T_MeshStandardMaterial_13($$anchor, {
								get color() {
									return $.get($0);
								}
							});
						});
					}

					var node_67 = $.sibling(node_66, 2);

					Edges(node_67, { color: 'black' });

					var node_68 = $.sibling(node_67, 2);

					Text(node_68, {
						text: 'SEL',
						fontSize: 0.15,
						color: '#111111',
						anchorX: 'center',
						anchorY: 'middle',
						position: [0, 0, 0.08]
					});

					$.append($$anchor, fragment_15);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_69 = $.sibling(node_64, 2);

	{
		let $0 = $.derived(() => [0.45, -0.8, front + startZ.current]);

		$.component(node_69, () => T.Mesh, ($$anchor, T_Mesh_14) => {
			T_Mesh_14($$anchor, {
				get position() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_16 = root_2();
					var node_70 = $.first_child(fragment_16);

					$.component(node_70, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_13) => {
						T_BoxGeometry_13($$anchor, { args: [0.7, 0.3, 0.15] });
					});

					var node_71 = $.sibling(node_70, 2);

					{
						let $0 = $.derived(() => btnStart.pressed ? activeColor : '#888888');

						$.component(node_71, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_14) => {
							T_MeshStandardMaterial_14($$anchor, {
								get color() {
									return $.get($0);
								}
							});
						});
					}

					var node_72 = $.sibling(node_71, 2);

					Edges(node_72, { color: 'black' });

					var node_73 = $.sibling(node_72, 2);

					Text(node_73, {
						text: 'START',
						fontSize: 0.15,
						color: '#111111',
						anchorX: 'center',
						anchorY: 'middle',
						position: [0, 0, 0.08]
					});

					$.append($$anchor, fragment_16);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_74 = $.sibling(node_69, 2);

	{
		let $0 = $.derived(() => $connected() ? 'Gamepad connected' : 'Connect a gamepad');
		let $1 = $.derived(() => $connected() ? '#4a9' : '#888888');

		Text(node_74, {
			get text() {
				return $.get($0);
			},
			fontSize: 0.25,
			get color() {
				return $.get($1);
			},
			anchorX: 'center',
			anchorY: 'middle',
			position: [0, -2.25, 0]
		});
	}

	var node_75 = $.sibling(node_74, 2);

	$.component(node_75, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			position: [0, -3.5, 0],
			children: ($$anchor, $$slotProps) => {
				HTML($$anchor, {
					center: true,
					transform: false,
					children: ($$anchor, $$slotProps) => {
						var div = root_5();

						$.each(div, 21, () => trackedButtons, $.index, ($$anchor, button) => {
							var fragment_18 = root_1();
							var node_76 = $.first_child(fragment_18);

							{
								var consequent_1 = ($$anchor) => {
									var span = root_3();
									var text = $.only_child(span);

									$.template_effect(() => $.set_text(text, `${$.get(button).label ?? ''} justPressed`));
									$.transition(2, span, () => fly, () => ({ y: 20, duration: 400 }));
									$.append($$anchor, span);
								};

								$.if(node_76, ($$render) => {
									if ($.get(button).state.justPressed) $$render(consequent_1);
								});
							}

							var node_77 = $.sibling(node_76, 2);

							{
								var consequent_2 = ($$anchor) => {
									var span_1 = root_4();
									var text_1 = $.only_child(span_1);

									$.template_effect(() => $.set_text(text_1, `${$.get(button).label ?? ''} justReleased`));
									$.transition(2, span_1, () => fly, () => ({ y: 20, duration: 400 }));
									$.append($$anchor, span_1);
								};

								$.if(node_77, ($$render) => {
									if ($.get(button).state.justReleased) $$render(consequent_2);
								});
							}

							$.append($$anchor, fragment_18);
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
	$$cleanup();
}