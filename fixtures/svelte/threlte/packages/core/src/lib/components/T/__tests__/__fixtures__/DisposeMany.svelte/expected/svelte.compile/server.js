import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';

export default function DisposeMany($$renderer) {
	if (T.Group) {
		$$renderer.push('<!--[-->');

		T.Group($$renderer, {
			children: ($$renderer) => {
				if (T.Mesh) {
					$$renderer.push('<!--[-->');

					T.Mesh($$renderer, {
						name: 'box',
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

							if (T.MeshBasicMaterial) {
								$$renderer.push('<!--[-->');

								T.MeshBasicMaterial($$renderer, {
									children: ($$renderer) => {
										if (T.Texture) {
											$$renderer.push('<!--[-->');
											T.Texture($$renderer, { attach: 'map' });
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

							if (T.Group) {
								$$renderer.push('<!--[-->');

								T.Group($$renderer, {
									children: ($$renderer) => {
										if (T.Mesh) {
											$$renderer.push('<!--[-->');

											T.Mesh($$renderer, {
												name: 'plane',
												children: ($$renderer) => {
													if (T.PlaneGeometry) {
														$$renderer.push('<!--[-->');
														T.PlaneGeometry($$renderer, {});
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (T.MeshStandardMaterial) {
														$$renderer.push('<!--[-->');
														T.MeshStandardMaterial($$renderer, {});
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