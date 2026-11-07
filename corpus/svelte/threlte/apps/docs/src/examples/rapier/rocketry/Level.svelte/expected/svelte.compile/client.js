import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { AutoColliders } from '@threlte/rapier';
import Goal from './Goal.svelte';
import Rocket from './Rocket.svelte';
import Start from './Start.svelte';
import FollowCamera from './FollowCamera.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Level($$anchor, $$props) {
	$.push($$props, true);

	let goalReached = $.state(false);
	let rocketSleeping = $.state(false);

	$.user_effect(() => {
		if ($.get(goalReached) && $.get(rocketSleeping)) {
			$$props.levelcomplete();
		}
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	Start(node, {
		get position() {
			return $$props.level.start.position;
		},

		get rotation() {
			return $$props.level.start.rotation;
		},

		children: ($$anchor, $$slotProps) => {
			{
				const children = ($$anchor) => {
					FollowCamera($$anchor, {});
				};

				Rocket($$anchor, {
					get checkIsStatic() {
						return $.get(goalReached);
					},
					onsleep: () => $.set(rocketSleeping, true),
					children,
					$$slots: { default: true }
				});
			}
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Goal(node_1, {
		get position() {
			return $$props.level.goal.position;
		},

		get rotation() {
			return $$props.level.goal.rotation;
		},

		ongoal: () => {
			$.set(goalReached, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	$.each(node_2, 17, () => $$props.level.blocks, $.index, ($$anchor, block) => {
		var fragment_3 = $.comment();
		var node_3 = $.first_child(fragment_3);

		$.component(node_3, () => T.Group, ($$anchor, T_Group) => {
			T_Group($$anchor, {
				get position() {
					return $.get(block).position;
				},

				get rotation() {
					return $.get(block).rotation;
				},

				children: ($$anchor, $$slotProps) => {
					AutoColliders($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = $.comment();
							var node_4 = $.first_child(fragment_5);

							$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh) => {
								T_Mesh($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root();
										var node_5 = $.first_child(fragment_6);

										$.component(node_5, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
											T_BoxGeometry($$anchor, { args: [1, 1, 1] });
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
											T_MeshStandardMaterial($$anchor, { color: 'blue', transparent: true, opacity: 0.4 });
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		});

		$.append($$anchor, fragment_3);
	});

	var node_7 = $.sibling(node_2, 2);

	$.component(node_7, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, {});
	});

	var node_8 = $.sibling(node_7, 2);

	$.component(node_8, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {
			position: [4, 10, 0],
			castShadow: true,
			'shadow.mapSize': 1024,
			'shadow.camera.left': -10,
			'shadow.camera.right': 10,
			'shadow.camera.top': 10,
			'shadow.camera.bottom': -10
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}