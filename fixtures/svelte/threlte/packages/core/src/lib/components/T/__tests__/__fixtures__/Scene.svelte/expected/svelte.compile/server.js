import * as $ from 'svelte/internal/server';
import { T, injectPlugin } from '@threlte/core';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { attached = true, dispose, plugin } = $$props;

		injectPlugin('plugin-name', (args) => {
			plugin?.fn(args);

			if (plugin?.props) {
				return { pluginProps: plugin.props };
			}

			return;
		});

		if (attached) {
			$$renderer.push('<!--[0-->');

			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					dispose,
					children: ($$renderer) => {
						if (T.Group) {
							$$renderer.push('<!--[-->');

							T.Group($$renderer, {
								name: 'parent',
								children: ($$renderer) => {
									if (T.Mesh) {
										$$renderer.push('<!--[-->');

										T.Mesh($$renderer, {
											name: 'child',
											lookat: [0, 0, 0],
											children: ($$renderer) => {
												if (T.BufferGeometry) {
													$$renderer.push('<!--[-->');
													T.BufferGeometry($$renderer, { name: 'geometry' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (T.MeshBasicMaterial) {
													$$renderer.push('<!--[-->');

													T.MeshBasicMaterial($$renderer, {
														name: 'material',
														children: ($$renderer) => {
															if (T.Texture) {
																$$renderer.push('<!--[-->');
																T.Texture($$renderer, { attach: 'map', name: 'texture' });
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
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}