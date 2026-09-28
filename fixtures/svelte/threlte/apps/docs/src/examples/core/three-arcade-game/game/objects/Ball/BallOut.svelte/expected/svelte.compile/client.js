import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { BoxGeometry, MeshBasicMaterial, Mesh, MathUtils, Group } from 'three';
import { useTimeout } from '../../hooks/useTimeout.svelte';
import { game } from '../../Game.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function BallOut($$anchor, $$props) {
	$.push($$props, true);

	const geometry = new BoxGeometry(1, 0.01, 0.1);
	const material = new MeshBasicMaterial({ color: 'red' });
	const { timeout } = useTimeout();
	let noBlink = false;

	timeout(
		() => {
			noBlink = true;
		},
		1e3
	);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => !game.blinkClock || noBlink);
		let $1 = $.derived(() => MathUtils.degToRad(45));

		$.component(node, () => T.Group, ($$anchor, T_Group) => {
			T_Group($$anchor, {
				get visible() {
					return $.get($0);
				},

				get 'position.z'() {
					return game.ballPosition.z;
				},

				get 'position.x'() {
					return game.ballPosition.x;
				},

				get 'rotation.y'() {
					return $.get($1);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
						T_Mesh($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root();
								var node_2 = $.first_child(fragment_2);

								T(node_2, {
									get is() {
										return geometry;
									}
								});

								var node_3 = $.sibling(node_2, 2);

								T(node_3, {
									get is() {
										return material;
									}
								});

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});

					var node_4 = $.sibling(node_1, 2);

					{
						let $0 = $.derived(() => MathUtils.degToRad(90));

						$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh_1) => {
							T_Mesh_1($$anchor, {
								get 'rotation.y'() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_5 = $.first_child(fragment_3);

									T(node_5, {
										get is() {
											return geometry;
										}
									});

									var node_6 = $.sibling(node_5, 2);

									T(node_6, {
										get is() {
											return material;
										}
									});

									$.append($$anchor, fragment_3);
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
	}

	$.append($$anchor, fragment);
	$.pop();
}