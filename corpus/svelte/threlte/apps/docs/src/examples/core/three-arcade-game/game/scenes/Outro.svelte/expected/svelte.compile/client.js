import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MathUtils } from 'three';
import { T } from '@threlte/core';
import { Audio, Edges, Text } from '@threlte/extras';
import { Tween } from 'svelte/motion';
import { useTimeout } from '../hooks/useTimeout.svelte';
import { useArcadeControls } from '../controls.svelte';
import { game } from '../Game.svelte';
import ThrelteLogo from '../objects/ThrelteLogo.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Outro($$anchor, $$props) {
	$.push($$props, true);

	const { timeout } = useTimeout();
	const controls = useArcadeControls();
	const left = controls.action('left');
	const right = controls.action('right');
	let direction = $.state(1);

	$.user_effect(() => {
		if (left.justPressed) $.set(direction, -1); else if (right.justPressed) $.set(direction, 1);
	});

	const logoScale = new Tween(0);

	timeout(
		() => {
			logoScale.set(1);
		},
		1.5e3
	);

	const textScale = new Tween(0);
	const textRotation = new Tween(10);

	timeout(
		() => {
			textScale.set(1);
			textRotation.set(0);
		},
		200
	);

	let showPressSpaceToStart = $.state(false);
	let blinkClock = $.state(0);

	timeout(
		() => {
			$.set(showPressSpaceToStart, true);
		},
		5e3
	);

	$.user_effect(() => {
		const intervalHandler = setInterval(
			() => {
				if (!$.get(showPressSpaceToStart)) return;

				$.set(blinkClock, $.get(blinkClock) ? 0 : 1, true);
			},
			500
		);

		return () => clearInterval(intervalHandler);
	});

	var fragment = root();
	var node = $.first_child(fragment);

	Audio(node, { src: '/audio/arcade_intro.mp3', loop: true, autoplay: true });

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			'position.z': -0.35,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_2 = $.first_child(fragment_1);

				ThrelteLogo(node_2, {
					positionZ: -1.2,
					get direction() {
						return $.get(direction);
					}
				});

				var node_3 = $.sibling(node_2, 2);

				{
					let $0 = $.derived(() => MathUtils.degToRad(-90));

					$.component(node_3, () => T.Group, ($$anchor, T_Group_1) => {
						T_Group_1($$anchor, {
							get scale() {
								return textScale.current;
							},
							'position.z': 1.3,
							get 'rotation.x'() {
								return $.get($0);
							},

							get 'rotation.z'() {
								return textRotation;
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root_1();
								var node_4 = $.first_child(fragment_2);

								$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh) => {
									T_Mesh($$anchor, {
										'position.y': -0.05,
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root();
											var node_5 = $.first_child(fragment_3);

											$.component(node_5, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
												T_PlaneGeometry($$anchor, { args: [11, 2] });
											});

											var node_6 = $.sibling(node_5, 2);

											$.component(node_6, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
												T_MeshBasicMaterial($$anchor, { transparent: true, opacity: 0 });
											});

											var node_7 = $.sibling(node_6, 2);

											Edges(node_7, {
												get color() {
													return game.baseColor;
												}
											});

											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								});

								var node_8 = $.sibling(node_4, 2);

								{
									let $0 = $.derived(() => `THRELTE MASTER\nSCORE ${game.score}`);

									Text(node_8, {
										font: '/fonts/beefd.ttf',
										anchorX: '50%',
										anchorY: '50%',
										textAlign: 'center',
										fontSize: 0.5,
										get color() {
											return game.baseColor;
										},

										get text() {
											return $.get($0);
										}
									});
								}

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_9 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_4 = $.comment();
			var node_10 = $.first_child(fragment_4);

			{
				let $0 = $.derived(() => MathUtils.degToRad(-90));
				let $1 = $.derived(() => !!$.get(blinkClock));

				$.component(node_10, () => T.Group, ($$anchor, T_Group_2) => {
					T_Group_2($$anchor, {
						get scale() {
							return textScale.current;
						},
						'position.z': 3.3,
						get 'rotation.x'() {
							return $.get($0);
						},

						get visible() {
							return $.get($1);
						},

						children: ($$anchor, $$slotProps) => {
							Text($$anchor, {
								font: '/fonts/beefd.ttf',
								anchorX: '50%',
								anchorY: '50%',
								textAlign: 'center',
								fontSize: 0.35,
								get color() {
									return game.baseColor;
								},
								text: 'PRESS SPACE TO RESTART'
							});
						},
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_4);
		};

		$.if(node_9, ($$render) => {
			if ($.get(showPressSpaceToStart)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}