import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { AutoColliders, RigidBody } from '@threlte/rapier';
import IsStatic from './IsStatic.svelte';
import Player from './Player.svelte';
import Thruster from './Thruster.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Rocket($$anchor, $$props) {
	let currentSide = $.state('left');
	const getPlayer = (key) => players.find((p) => p.key === key);
	let players = $.proxy([]);

	$.event('keydown', $.window, (e) => {
		const pk = e.key;

		// check if player is already registered
		if (getPlayer(pk)) return;

		// check if key is from a-z
		if (!pk.match(/^[a-z]$/)) return;

		// check if it has a modifier
		if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;

		const player = { side: $.get(currentSide), key: pk, active: false };

		players.push(player);
		$.set(currentSide, $.get(currentSide) === 'left' ? 'right' : 'left', true);
	});

	$.event('keyup', $.window, (e) => {
		const pk = e.key;
		const player = getPlayer(pk);

		if (!player) return;

		player.active = true;
	});

	{
		const children = ($$anchor, $$arg0) => {
			let rigidBody = () => ($$arg0?.()).rigidBody;
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.snippet(node, () => $$props.children ?? $.noop);

			var node_1 = $.sibling(node, 2);

			{
				var consequent = ($$anchor) => {
					IsStatic($$anchor, {
						get rigidBody() {
							return rigidBody();
						},
						linearMax: 0.00001,
						angularMax: 0.00001,
						get onstatic() {
							return $$props.onsleep;
						}
					});
				};

				$.if(node_1, ($$render) => {
					if ($$props.checkIsStatic) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			$.each(node_2, 17, () => players, $.index, ($$anchor, player) => {
				{
					const children = ($$anchor, active = $.noop) => {
						Thruster($$anchor, {
							get active() {
								return active();
							}
						});
					};

					let $0 = $.derived(() => $.get(player).side === 'left' ? -0.5 : 0.25);
					let $1 = $.derived(() => $.get(player).side === 'left' ? -0.25 : 0.5);

					Player($$anchor, {
						get rigidBody() {
							return rigidBody();
						},

						get key() {
							return $.get(player).key;
						},

						get min() {
							return $.get($0);
						},

						get max() {
							return $.get($1);
						},

						get active() {
							return $.get(player).active;
						},
						children,
						$$slots: { default: true }
					});
				}
			});

			var node_3 = $.sibling(node_2, 2);

			AutoColliders(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = $.comment();
					var node_4 = $.first_child(fragment_5);

					$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh) => {
						T_Mesh($$anchor, {
							castShadow: true,
							receiveShadow: true,
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root();
								var node_5 = $.first_child(fragment_6);

								$.component(node_5, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
									T_MeshStandardMaterial($$anchor, { color: 'red', transparent: true, opacity: 0.4 });
								});

								var node_6 = $.sibling(node_5, 2);

								$.component(node_6, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
									T_BoxGeometry($$anchor, {});
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

			$.append($$anchor, fragment_1);
		};

		RigidBody($$anchor, {
			canSleep: false,
			linearDamping: 0.4,
			angularDamping: 5,
			enabledRotations: [false, false, true],
			type: 'dynamic',
			children,
			$$slots: { default: true }
		});
	}
}