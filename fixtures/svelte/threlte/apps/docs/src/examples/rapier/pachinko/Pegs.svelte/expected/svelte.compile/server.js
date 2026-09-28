import * as $ from 'svelte/internal/server';
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

export default function Pegs($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		RigidBody($$renderer, {
			type: 'fixed',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(pegs);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let peg = each_array[$$index];

					if (T.Group) {
						$$renderer.push('<!--[-->');

						T.Group($$renderer, {
							position: [peg.x, peg.y, 0.05],
							rotation: [Math.PI / 2, 0, 0],
							children: ($$renderer) => {
								Collider($$renderer, {
									shape: 'cylinder',
									args: [0.2, 0.07],
									restitution: 0.6,
									friction: 0.05,
									contactForceEventThreshold: PEG_CONTACT_THRESHOLD,
									oncontact: peg.onContact
								});

								$$renderer.push(`<!----> `);

								if (T.Mesh) {
									$$renderer.push('<!--[-->');

									T.Mesh($$renderer, {
										castShadow: true,
										geometry: pegGeometry,
										material: peg.material
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
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}