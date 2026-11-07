import * as $ from 'svelte/internal/server';
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

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let backgroundColor = $.derived(() => machineIsOff() ? new Color('black') : new Color('#08060a'));
		const tweenedBackgroundColor = Tween.of(() => backgroundColor(), { duration: 1e3 });
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Renderer($$renderer, {});
			$$renderer.push(`<!----> `);

			if (T.Scene) {
				$$renderer.push('<!--[-->');

				T.Scene($$renderer, {
					get ref() {
						return game.gameScene;
					},

					set ref($$value) {
						game.gameScene = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								children: ($$renderer) => {
									if (T.SphereGeometry) {
										$$renderer.push('<!--[-->');
										T.SphereGeometry($$renderer, { args: [50, 32, 32] });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (T.MeshBasicMaterial) {
										$$renderer.push('<!--[-->');
										T.MeshBasicMaterial($$renderer, { side: BackSide, color: tweenedBackgroundColor.current });
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

						if (T.PerspectiveCamera) {
							$$renderer.push('<!--[-->');

							T.PerspectiveCamera($$renderer, {
								manual: true,
								args: [50, 4 / 3, 0.1, 100],
								position: [0, 10, 0],
								'rotation.x': -90 * MathUtils.DEG2RAD,
								get ref() {
									return game.gameCamera;
								},

								set ref($$value) {
									game.gameCamera = $$value;
									$$settled = false;
								}
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.AmbientLight) {
							$$renderer.push('<!--[-->');
							T.AmbientLight($$renderer, { intensity: 0.3 });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.DirectionalLight) {
							$$renderer.push('<!--[-->');
							T.DirectionalLight($$renderer, { position: [4, 10, 2] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (showIntro()) {
							$$renderer.push('<!--[0-->');
							Intro($$renderer, {});
						} else if (showOutro()) {
							$$renderer.push('<!--[1-->');
							Outro($$renderer, {});
						} else if (game.state !== 'off') {
							$$renderer.push('<!--[2-->');
							Ball($$renderer, {});
							$$renderer.push(`<!----> `);
							Arena($$renderer, {});
							$$renderer.push(`<!----> `);
							Player($$renderer, {});
							$$renderer.push(`<!----> `);

							if (showLevel()) {
								$$renderer.push(`<!--[0--><!---->`);

								{
									Level($$renderer, {});
								}

								$$renderer.push(`<!---->`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);
							GUI($$renderer, {});
							$$renderer.push(`<!---->`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}