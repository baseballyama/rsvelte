import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { Collider, RigidBody } from '@threlte/rapier';
import { CylinderGeometry, MeshStandardMaterial } from 'three';

import {
	CHANNEL_X,
	FIELD_HEIGHT,
	FIELD_WIDTH,
	windmills,
	WINDMILL_CLEARANCE
} from './gameState.svelte';

const pegGeometry = new CylinderGeometry(0.07, 0.07, 0.4, 12);
const PEG_BASE_EMISSIVE = 0.4;
const PEG_FLASH_EMISSIVE = 3.5;
const PEG_EMISSIVE_DECAY_PER_SEC = 9;
const PEG_CONTACT_THRESHOLD = 1.5;
var root = $.from_html(`<!> <!>`, 1);

export default function Pegs($$anchor, $$props) {
	$.push($$props, true);

	const pegs = [];
	const rows = 14;
	const cols = 9;
	const horizontalSpacing = 0.55;
	const verticalSpacing = 0.5;
	const fieldLeft = -FIELD_WIDTH / 2 + 0.6;
	const fieldRight = CHANNEL_X - 0.7;
	const fieldBottom = -FIELD_HEIGHT / 2 + 1.4;
	const fieldTop = FIELD_HEIGHT / 2 - 1.6;

	const insideWindmillClearance = (x, y) => windmills.some(({ position: [wx, wy] }) => {
		const dx = x - wx;
		const dy = y - wy;

		return dx * dx + dy * dy < WINDMILL_CLEARANCE * WINDMILL_CLEARANCE;
	});

	for (let r = 0; r < rows; r += 1) {
		const y = fieldBottom + r * verticalSpacing;

		if (y > fieldTop) break;

		const offset = r % 2 === 0 ? 0 : horizontalSpacing / 2;

		for (let c = 0; c < cols; c += 1) {
			const x = fieldLeft + c * horizontalSpacing + offset;

			if (x > fieldRight) break;
			if (insideWindmillClearance(x, y)) continue;

			const material = new MeshStandardMaterial({
				color: '#e8d68a',
				metalness: 0.85,
				roughness: 0.22,
				emissive: '#ffe080',
				emissiveIntensity: PEG_BASE_EMISSIVE
			});

			const onContact = (event) => {
				if (event.totalForceMagnitude < PEG_CONTACT_THRESHOLD) return;

				material.emissiveIntensity = PEG_FLASH_EMISSIVE;
			};

			pegs.push({ x, y, material, onContact });
		}
	}

	useTask((delta) => {
		const decay = PEG_EMISSIVE_DECAY_PER_SEC * delta;

		for (const peg of pegs) {
			if (peg.material.emissiveIntensity > PEG_BASE_EMISSIVE) {
				peg.material.emissiveIntensity = Math.max(PEG_BASE_EMISSIVE, peg.material.emissiveIntensity - decay);
			}
		}
	});

	RigidBody($$anchor, {
		type: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 16, () => pegs, (peg) => peg, ($$anchor, peg) => {
				var fragment_2 = $.comment();
				var node_1 = $.first_child(fragment_2);

				{
					let $0 = $.derived(() => [peg.x, peg.y, 0.05]);

					$.component(node_1, () => T.Group, ($$anchor, T_Group) => {
						T_Group($$anchor, {
							get position() {
								return $.get($0);
							},
							rotation: [Math.PI / 2, 0, 0],
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_2 = $.first_child(fragment_3);

								Collider(node_2, {
									shape: 'cylinder',
									args: [0.2, 0.07],
									restitution: 0.6,
									friction: 0.05,
									contactForceEventThreshold: PEG_CONTACT_THRESHOLD,
									get oncontact() {
										return peg.onContact;
									}
								});

								var node_3 = $.sibling(node_2, 2);

								$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
									T_Mesh($$anchor, {
										castShadow: true,
										get geometry() {
											return pegGeometry;
										},

										get material() {
											return peg.material;
										}
									});
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});
				}

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}