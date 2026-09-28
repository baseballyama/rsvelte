import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Edges, HTML, Text, useGamepad, useTexture } from '@threlte/extras';
import { fly } from 'svelte/transition';
import { Spring } from 'svelte/motion';
import { Color } from 'three';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { gamepadRef = void 0 } = $$props;
		const gamepad = useGamepad();

		gamepadRef = gamepad;

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

		if (T.OrthographicCamera) {
			$$renderer.push('<!--[-->');

			T.OrthographicCamera($$renderer, {
				zoom: 70,
				position: [7, 5, 8],
				makeDefault: true,
				oncreate: (ref) => ref.lookAt(2, 0, 0)
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, { intensity: 0.6 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');
			T.DirectionalLight($$renderer, { position: [3, 5, 5], intensity: 0.8 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				children: ($$renderer) => {
					if (T.BoxGeometry) {
						$$renderer.push('<!--[-->');
						T.BoxGeometry($$renderer, { args: [7, 3, bodyDepth] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: bodyColor });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					Edges($$renderer, { color: 'black', scale: 1.001 });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if ($.store_get($$store_subs ??= {}, '$logo', logo)) {
			$$renderer.push('<!--[0-->');

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					position: [0, 0.2, front + 0.01],
					children: ($$renderer) => {
						if (T.PlaneGeometry) {
							$$renderer.push('<!--[-->');
							T.PlaneGeometry($$renderer, { args: [1.5, 1.5] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.MeshStandardMaterial) {
							$$renderer.push('<!--[-->');

							T.MeshStandardMaterial($$renderer, {
								map: $.store_get($$store_subs ??= {}, '$logo', logo),
								transparent: true
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
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				position: [-2.25, top + 0.1 - lt.value * 0.1, 0],
				children: ($$renderer) => {
					if (T.BoxGeometry) {
						$$renderer.push('<!--[-->');
						T.BoxGeometry($$renderer, { args: [1.8, 0.2, 0.5] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');

						T.MeshStandardMaterial($$renderer, {
							color: color1.set(triggerColor).lerp(color2.set(activeColor), lt.value).getHex()
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					Edges($$renderer, { color: 'black' });
					$$renderer.push(`<!----> `);

					Text($$renderer, {
						text: 'LT',
						fontSize: 0.18,
						color: lt.pressed ? activeTextColor : bodyColor,
						anchorX: 'center',
						anchorY: 'middle',
						position: [0, 0.11, 0],
						rotation: [-Math.PI / 2, 0, 0]
					});

					$$renderer.push(`<!---->`);
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
				position: [2.25, top + 0.1 - rt.value * 0.1, 0],
				children: ($$renderer) => {
					if (T.BoxGeometry) {
						$$renderer.push('<!--[-->');
						T.BoxGeometry($$renderer, { args: [1.8, 0.2, 0.5] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');

						T.MeshStandardMaterial($$renderer, {
							color: color1.set(triggerColor).lerp(color2.set(activeColor), rt.value).getHex()
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					Edges($$renderer, { color: 'black' });
					$$renderer.push(`<!----> `);

					Text($$renderer, {
						text: 'RT',
						fontSize: 0.18,
						color: rt.pressed ? activeTextColor : bodyColor,
						anchorX: 'center',
						anchorY: 'middle',
						position: [0, 0.11, 0],
						rotation: [-Math.PI / 2, 0, 0]
					});

					$$renderer.push(`<!---->`);
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
				position: [dpadX, padY + 0.6, front + dUpZ.current],
				children: ($$renderer) => {
					if (T.BoxGeometry) {
						$$renderer.push('<!--[-->');
						T.BoxGeometry($$renderer, { args: [s, s, bh] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: dUp.touched ? activeColor : buttonColor });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					Edges($$renderer, { color: 'black' });
					$$renderer.push(`<!----> `);

					Text($$renderer, {
						text: '\u25B2',
						fontSize: 0.25,
						color: dUp.pressed ? activeTextColor : bodyColor,
						anchorX: 'center',
						anchorY: 'middle',
						position: [0, 0, textZ]
					});

					$$renderer.push(`<!---->`);
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
				position: [dpadX, padY - 0.6, front + dDownZ.current],
				children: ($$renderer) => {
					if (T.BoxGeometry) {
						$$renderer.push('<!--[-->');
						T.BoxGeometry($$renderer, { args: [s, s, bh] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: dDown.pressed ? activeColor : buttonColor });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					Edges($$renderer, { color: 'black' });
					$$renderer.push(`<!----> `);

					Text($$renderer, {
						text: '\u25BC',
						fontSize: 0.25,
						color: dDown.pressed ? activeTextColor : bodyColor,
						anchorX: 'center',
						anchorY: 'middle',
						position: [0, 0, textZ]
					});

					$$renderer.push(`<!---->`);
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
				position: [dpadX - 0.6, padY, front + dLeftZ.current],
				children: ($$renderer) => {
					if (T.BoxGeometry) {
						$$renderer.push('<!--[-->');
						T.BoxGeometry($$renderer, { args: [s, s, bh] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: dLeft.pressed ? activeColor : buttonColor });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					Edges($$renderer, { color: 'black' });
					$$renderer.push(`<!----> `);

					Text($$renderer, {
						text: '\u25C0',
						fontSize: 0.25,
						color: dLeft.pressed ? activeTextColor : bodyColor,
						anchorX: 'center',
						anchorY: 'middle',
						position: [0, 0, textZ]
					});

					$$renderer.push(`<!---->`);
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
				position: [dpadX + 0.6, padY, front + dRightZ.current],
				children: ($$renderer) => {
					if (T.BoxGeometry) {
						$$renderer.push('<!--[-->');
						T.BoxGeometry($$renderer, { args: [s, s, bh] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: dRight.pressed ? activeColor : buttonColor });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					Edges($$renderer, { color: 'black' });
					$$renderer.push(`<!----> `);

					Text($$renderer, {
						text: '\u25B6',
						fontSize: 0.25,
						color: dRight.pressed ? activeTextColor : bodyColor,
						anchorX: 'center',
						anchorY: 'middle',
						position: [0, 0, textZ]
					});

					$$renderer.push(`<!---->`);
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
				position: [dpadX, padY, front],
				children: ($$renderer) => {
					if (T.BoxGeometry) {
						$$renderer.push('<!--[-->');
						T.BoxGeometry($$renderer, { args: [s, s, bh] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: buttonColor });
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

		$$renderer.push(` `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				position: [clusterX, padY - 0.6, front + aZ.current],
				children: ($$renderer) => {
					if (T.BoxGeometry) {
						$$renderer.push('<!--[-->');
						T.BoxGeometry($$renderer, { args: [s, s, bh] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: btnA.pressed ? activeColor : buttonColor });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					Edges($$renderer, { color: 'black' });
					$$renderer.push(`<!----> `);

					Text($$renderer, {
						text: 'A',
						fontSize: 0.3,
						color: btnA.pressed ? activeTextColor : bodyColor,
						anchorX: 'center',
						anchorY: 'middle',
						position: [0, 0, textZ]
					});

					$$renderer.push(`<!---->`);
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
				position: [clusterX + 0.65, padY, front + bZ.current],
				children: ($$renderer) => {
					if (T.BoxGeometry) {
						$$renderer.push('<!--[-->');
						T.BoxGeometry($$renderer, { args: [s, s, bh] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: btnB.pressed ? activeColor : buttonColor });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					Edges($$renderer, { color: 'black' });
					$$renderer.push(`<!----> `);

					Text($$renderer, {
						text: 'B',
						fontSize: 0.3,
						color: btnB.pressed ? activeTextColor : bodyColor,
						anchorX: 'center',
						anchorY: 'middle',
						position: [0, 0, textZ]
					});

					$$renderer.push(`<!---->`);
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
				position: [clusterX - 0.65, padY, front + xZ.current],
				children: ($$renderer) => {
					if (T.BoxGeometry) {
						$$renderer.push('<!--[-->');
						T.BoxGeometry($$renderer, { args: [s, s, bh] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: btnX.pressed ? activeColor : buttonColor });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					Edges($$renderer, { color: 'black' });
					$$renderer.push(`<!----> `);

					Text($$renderer, {
						text: 'X',
						fontSize: 0.3,
						color: btnX.pressed ? activeTextColor : bodyColor,
						anchorX: 'center',
						anchorY: 'middle',
						position: [0, 0, textZ]
					});

					$$renderer.push(`<!---->`);
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
				position: [clusterX, padY + 0.6, front + yZ.current],
				children: ($$renderer) => {
					if (T.BoxGeometry) {
						$$renderer.push('<!--[-->');
						T.BoxGeometry($$renderer, { args: [s, s, bh] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: btnY.pressed ? activeColor : buttonColor });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					Edges($$renderer, { color: 'black' });
					$$renderer.push(`<!----> `);

					Text($$renderer, {
						text: 'Y',
						fontSize: 0.3,
						color: btnY.pressed ? activeTextColor : bodyColor,
						anchorX: 'center',
						anchorY: 'middle',
						position: [0, 0, textZ]
					});

					$$renderer.push(`<!---->`);
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
				position: [-0.45, -0.8, front + selZ.current],
				children: ($$renderer) => {
					if (T.BoxGeometry) {
						$$renderer.push('<!--[-->');
						T.BoxGeometry($$renderer, { args: [0.7, 0.3, 0.15] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: sel.pressed ? activeColor : '#888888' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					Edges($$renderer, { color: 'black' });
					$$renderer.push(`<!----> `);

					Text($$renderer, {
						text: 'SEL',
						fontSize: 0.15,
						color: '#111111',
						anchorX: 'center',
						anchorY: 'middle',
						position: [0, 0, 0.08]
					});

					$$renderer.push(`<!---->`);
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
				position: [0.45, -0.8, front + startZ.current],
				children: ($$renderer) => {
					if (T.BoxGeometry) {
						$$renderer.push('<!--[-->');
						T.BoxGeometry($$renderer, { args: [0.7, 0.3, 0.15] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: btnStart.pressed ? activeColor : '#888888' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					Edges($$renderer, { color: 'black' });
					$$renderer.push(`<!----> `);

					Text($$renderer, {
						text: 'START',
						fontSize: 0.15,
						color: '#111111',
						anchorX: 'center',
						anchorY: 'middle',
						position: [0, 0, 0.08]
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		Text($$renderer, {
			text: $.store_get($$store_subs ??= {}, '$connected', connected) ? 'Gamepad connected' : 'Connect a gamepad',
			fontSize: 0.25,
			color: $.store_get($$store_subs ??= {}, '$connected', connected) ? '#4a9' : '#888888',
			anchorX: 'center',
			anchorY: 'middle',
			position: [0, -2.25, 0]
		});

		$$renderer.push(`<!----> `);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				position: [0, -3.5, 0],
				children: ($$renderer) => {
					HTML($$renderer, {
						center: true,
						transform: false,
						children: ($$renderer) => {
							$$renderer.push(`<div class="states svelte-d7uj6m"><!--[-->`);

							const each_array = $.ensure_array_like(trackedButtons);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let button = each_array[$$index];

								if (button.state.justPressed) {
									$$renderer.push(`<!--[0--><span class="badge just-pressed svelte-d7uj6m">${$.escape(button.label)} justPressed</span>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								if (button.state.justReleased) {
									$$renderer.push(`<!--[0--><span class="badge just-released svelte-d7uj6m">${$.escape(button.label)} justReleased</span>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							}

							$$renderer.push(`<!--]--></div>`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { gamepadRef });
	});
}