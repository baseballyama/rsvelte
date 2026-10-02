import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { OrbitControls, Environment } from '@threlte/extras';
import { AutoColliders, CollisionGroups, RigidBody } from '@threlte/rapier';
import Ground from './Ground.svelte';

export default function Scene($$renderer, $$props) {
	let resetCounter = 0;

	const reset = () => {
		resetCounter += 1;
	};

	Environment($$renderer, {
		url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
	});

	$$renderer.push(`<!----> `);

	if (T.PerspectiveCamera) {
		$$renderer.push('<!--[-->');

		T.PerspectiveCamera($$renderer, {
			makeDefault: true,
			'position.x': 12,
			'position.y': 13,
			fov: 40,
			children: ($$renderer) => {
				OrbitControls($$renderer, { enableDamping: true, enableZoom: false });
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (T.DirectionalLight) {
		$$renderer.push('<!--[-->');
		T.DirectionalLight($$renderer, { castShadow: true, position: [8, 20, -3] });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` <!---->`);

	{
		CollisionGroups($$renderer, {
			memberships: [1],
			filter: [2],
			children: ($$renderer) => {
				if (T.Group) {
					$$renderer.push('<!--[-->');

					T.Group($$renderer, {
						position: [0, 1.5, 1 - Math.random() * 2],
						children: ($$renderer) => {
							RigidBody($$renderer, {
								children: ($$renderer) => {
									AutoColliders($$renderer, {
										shape: 'cuboid',
										children: ($$renderer) => {
											if (T.Mesh) {
												$$renderer.push('<!--[-->');

												T.Mesh($$renderer, {
													castShadow: true,
													children: ($$renderer) => {
														if (T.BoxGeometry) {
															$$renderer.push('<!--[-->');
															T.BoxGeometry($$renderer, {});
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (T.MeshStandardMaterial) {
															$$renderer.push('<!--[-->');
															T.MeshStandardMaterial($$renderer, { color: 'red' });
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
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		CollisionGroups($$renderer, {
			memberships: [2],
			filter: [1, 3],
			children: ($$renderer) => {
				if (T.Group) {
					$$renderer.push('<!--[-->');

					T.Group($$renderer, {
						position: [0, 4.5, 1 - Math.random() * 2],
						children: ($$renderer) => {
							RigidBody($$renderer, {
								children: ($$renderer) => {
									AutoColliders($$renderer, {
										shape: 'cuboid',
										children: ($$renderer) => {
											if (T.Mesh) {
												$$renderer.push('<!--[-->');

												T.Mesh($$renderer, {
													castShadow: true,
													children: ($$renderer) => {
														if (T.BoxGeometry) {
															$$renderer.push('<!--[-->');
															T.BoxGeometry($$renderer, {});
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (T.MeshStandardMaterial) {
															$$renderer.push('<!--[-->');
															T.MeshStandardMaterial($$renderer, { color: 'green' });
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
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		CollisionGroups($$renderer, {
			memberships: [3],
			filter: [2],
			children: ($$renderer) => {
				if (T.Group) {
					$$renderer.push('<!--[-->');

					T.Group($$renderer, {
						position: [0, 3, 1 - Math.random() * 2],
						children: ($$renderer) => {
							RigidBody($$renderer, {
								children: ($$renderer) => {
									AutoColliders($$renderer, {
										shape: 'cuboid',
										children: ($$renderer) => {
											if (T.Mesh) {
												$$renderer.push('<!--[-->');

												T.Mesh($$renderer, {
													castShadow: true,
													children: ($$renderer) => {
														if (T.BoxGeometry) {
															$$renderer.push('<!--[-->');
															T.BoxGeometry($$renderer, {});
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (T.MeshStandardMaterial) {
															$$renderer.push('<!--[-->');
															T.MeshStandardMaterial($$renderer, { color: 'blue' });
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
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	$$renderer.push(`<!----> `);

	if (T.GridHelper) {
		$$renderer.push('<!--[-->');
		T.GridHelper($$renderer, { args: [50] });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	CollisionGroups($$renderer, {
		groups: [1, 2, 3],
		children: ($$renderer) => {
			Ground($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
	$.bind_props($$props, { reset });
}