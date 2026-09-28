import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { MeshStandardMaterial } from 'three';

import {
	CABINET_WIDTH,
	CONTROL_PANEL_HEIGHT,
	CONTROL_PANEL_TILT,
	CONTROL_PANEL_Y,
	CROWN_HEIGHT,
	CROWN_Y,
	FIELD_HEIGHT,
	SIDE_RAIL_WIDTH
} from './gameState.svelte';

const cabinetMaterial = new MeshStandardMaterial({ color: '#1f1530', metalness: 0.55, roughness: 0.32 });

const trimMaterial = new MeshStandardMaterial({
	color: '#5a3a8a',
	metalness: 0.6,
	roughness: 0.28,
	emissive: '#3a1f6a',
	emissiveIntensity: 0.35
});

export default function Cabinet($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const halfCabinetW = CABINET_WIDTH / 2;
		const rail = SIDE_RAIL_WIDTH;

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				position: [0, CROWN_Y, 0],
				children: ($$renderer) => {
					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							castShadow: true,
							receiveShadow: true,
							material: cabinetMaterial,
							children: ($$renderer) => {
								if (T.BoxGeometry) {
									$$renderer.push('<!--[-->');
									T.BoxGeometry($$renderer, { args: [CABINET_WIDTH, CROWN_HEIGHT, 0.5] });
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
							position: [0, -CROWN_HEIGHT / 2 + 0.04, 0.26],
							material: trimMaterial,
							children: ($$renderer) => {
								if (T.BoxGeometry) {
									$$renderer.push('<!--[-->');
									T.BoxGeometry($$renderer, { args: [CABINET_WIDTH, 0.08, 0.02] });
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
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` <!--[-->`);

		const each_array = $.ensure_array_like([-1, 1]);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let side = each_array[$$index];

			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position: [side * (halfCabinetW - rail / 2), 0, 0],
					children: ($$renderer) => {
						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								castShadow: true,
								receiveShadow: true,
								material: cabinetMaterial,
								children: ($$renderer) => {
									if (T.BoxGeometry) {
										$$renderer.push('<!--[-->');
										T.BoxGeometry($$renderer, { args: [rail, FIELD_HEIGHT, 0.5] });
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
								position: [-side * (rail / 2 - 0.04), 0, 0.26],
								material: trimMaterial,
								children: ($$renderer) => {
									if (T.BoxGeometry) {
										$$renderer.push('<!--[-->');
										T.BoxGeometry($$renderer, { args: [0.06, FIELD_HEIGHT - 0.4, 0.02] });
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`<!--]--> `);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				position: [0, CONTROL_PANEL_Y, 0],
				rotation: [CONTROL_PANEL_TILT, 0, 0],
				children: ($$renderer) => {
					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							castShadow: true,
							receiveShadow: true,
							position: [0, -CONTROL_PANEL_HEIGHT / 2, 0],
							material: cabinetMaterial,
							children: ($$renderer) => {
								if (T.BoxGeometry) {
									$$renderer.push('<!--[-->');
									T.BoxGeometry($$renderer, { args: [CABINET_WIDTH, CONTROL_PANEL_HEIGHT, 0.5] });
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
							position: [0, 0, 0.26],
							material: trimMaterial,
							children: ($$renderer) => {
								if (T.BoxGeometry) {
									$$renderer.push('<!--[-->');
									T.BoxGeometry($$renderer, { args: [CABINET_WIDTH, 0.06, 0.02] });
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
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}