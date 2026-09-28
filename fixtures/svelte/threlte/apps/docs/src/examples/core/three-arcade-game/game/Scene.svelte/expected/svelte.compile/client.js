import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { Tween } from 'svelte/motion';
import { BackSide, Color, MathUtils } from 'three';
import Arena from './objects/Arena.svelte';
import Ball from './objects/Ball/Ball.svelte';
import Renderer from './Renderer.svelte';
import Intro from './scenes/Intro.svelte';
import Level from './scenes/Level.svelte';
import Outro from './scenes/Outro.svelte';
import Player from './objects/Player.svelte';
import { useArcadeControls } from './controls.svelte';
import { game } from './Game.svelte';
import GUI from './GUI.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const controls = useArcadeControls();

	useTask(
		() => {
			if (controls.action('toggleDebug').justPressed) {
				game.debug = !game.debug;
			}

			if (controls.action('toggleOrbit').justPressed) {
				game.orbitControls = !game.orbitControls;
			}

			if (!controls.action('advance').justPressed) return;
			if (game.state === 'level-loading') return;

			if (game.state === 'await-intro-skip') {
				game.startGame();
			} else if (game.state === 'game-over') {
				game.restart();
			} else if (game.state === 'menu') {
				game.startGame();
			} else if (game.state === 'level-complete') {
				game.nextLevel();
			} else if (game.state === 'await-ball-spawn') {
				game.state = 'playing';
			} else if (game.state === 'outro') {
				game.reset();
			}
		},
		{ after: controls.task }
	);

	let showLevel = $.derived(() => game.state === 'level-loading' || game.state === 'level-complete' || game.state === 'playing' || game.state === 'await-ball-spawn' || game.state === 'game-over');
	let showIntro = $.derived(() => game.state === 'intro' || game.state === 'await-intro-skip');
	let showOutro = $.derived(() => game.state === 'outro');
	let machineIsOff = $.derived(() => game.state === 'off' ? true : false);
	let backgroundColor = $.derived(() => $.get(machineIsOff) ? new Color('black') : new Color('#08060a'));
	const tweenedBackgroundColor = Tween.of(() => $.get(backgroundColor), { duration: 1e3 });
	var fragment = root();
	var node = $.first_child(fragment);

	Renderer(node, {});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.Scene, ($$anchor, T_Scene) => {
		T_Scene($$anchor, {
			get ref() {
				return game.gameScene;
			},

			set ref($$value) {
				game.gameScene = $$value;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_2 = $.first_child(fragment_1);

				$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
					T_Mesh($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
								T_SphereGeometry($$anchor, { args: [50, 32, 32] });
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
								T_MeshBasicMaterial($$anchor, {
									get side() {
										return BackSide;
									},

									get color() {
										return tweenedBackgroundColor.current;
									}
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_2, 2);

				{
					let $0 = $.derived(() => -90 * MathUtils.DEG2RAD);

					$.component(node_5, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
						T_PerspectiveCamera($$anchor, {
							manual: true,
							args: [50, 4 / 3, 0.1, 100],
							position: [0, 10, 0],
							get 'rotation.x'() {
								return $.get($0);
							},

							get ref() {
								return game.gameCamera;
							},

							set ref($$value) {
								game.gameCamera = $$value;
							}
						});
					});
				}

				var node_6 = $.sibling(node_5, 2);

				$.component(node_6, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
					T_AmbientLight($$anchor, { intensity: 0.3 });
				});

				var node_7 = $.sibling(node_6, 2);

				$.component(node_7, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
					T_DirectionalLight($$anchor, { position: [4, 10, 2] });
				});

				var node_8 = $.sibling(node_7, 2);

				{
					var consequent = ($$anchor) => {
						Intro($$anchor, {});
					};

					var consequent_1 = ($$anchor) => {
						Outro($$anchor, {});
					};

					var consequent_3 = ($$anchor) => {
						var fragment_5 = root_1();
						var node_9 = $.first_child(fragment_5);

						Ball(node_9, {});

						var node_10 = $.sibling(node_9, 2);

						Arena(node_10, {});

						var node_11 = $.sibling(node_10, 2);

						Player(node_11, {});

						var node_12 = $.sibling(node_11, 2);

						{
							var consequent_2 = ($$anchor) => {
								var fragment_6 = $.comment();
								var node_13 = $.first_child(fragment_6);

								$.key(node_13, () => game.levelIndex, ($$anchor) => {
									Level($$anchor, {});
								});

								$.append($$anchor, fragment_6);
							};

							$.if(node_12, ($$render) => {
								if ($.get(showLevel)) $$render(consequent_2);
							});
						}

						var node_14 = $.sibling(node_12, 2);

						GUI(node_14, {});
						$.append($$anchor, fragment_5);
					};

					$.if(node_8, ($$render) => {
						if ($.get(showIntro)) $$render(consequent); else if ($.get(showOutro)) $$render(consequent_1, 1); else if (game.state !== 'off') $$render(consequent_3, 2);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}