import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { OrbitControls, Grid, FakeGlowMaterial } from '@threlte/extras';

export default function Scene($$renderer) {
	if (T.Group) {
		$$renderer.push('<!--[-->');

		T.Group($$renderer, {
			'position.y': 2,
			'position.x': -3,
			children: ($$renderer) => {
				if (T.Mesh) {
					$$renderer.push('<!--[-->');

					T.Mesh($$renderer, {
						children: ($$renderer) => {
							if (T.MeshBasicMaterial) {
								$$renderer.push('<!--[-->');
								T.MeshBasicMaterial($$renderer, { color: 'green' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (T.IcosahedronGeometry) {
								$$renderer.push('<!--[-->');
								T.IcosahedronGeometry($$renderer, { args: [2, 4] });
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
						children: ($$renderer) => {
							FakeGlowMaterial($$renderer, {});
							$$renderer.push(`<!----> `);

							if (T.IcosahedronGeometry) {
								$$renderer.push('<!--[-->');
								T.IcosahedronGeometry($$renderer, { args: [4, 4] });
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

	$$renderer.push(` `);

	if (T.Group) {
		$$renderer.push('<!--[-->');

		T.Group($$renderer, {
			'position.y': 3,
			'position.x': 3,
			children: ($$renderer) => {
				if (T.Mesh) {
					$$renderer.push('<!--[-->');

					T.Mesh($$renderer, {
						children: ($$renderer) => {
							if (T.MeshBasicMaterial) {
								$$renderer.push('<!--[-->');
								T.MeshBasicMaterial($$renderer, { color: 'blue' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (T.BoxGeometry) {
								$$renderer.push('<!--[-->');
								T.BoxGeometry($$renderer, { args: [2, 2, 2] });
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
						children: ($$renderer) => {
							FakeGlowMaterial($$renderer, { glowColor: 'blue' });
							$$renderer.push(`<!----> `);

							if (T.IcosahedronGeometry) {
								$$renderer.push('<!--[-->');
								T.IcosahedronGeometry($$renderer, { args: [3, 4] });
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

	$$renderer.push(` `);

	if (T.Group) {
		$$renderer.push('<!--[-->');

		T.Group($$renderer, {
			'position.y': 6,
			'position.x': 0,
			children: ($$renderer) => {
				if (T.Mesh) {
					$$renderer.push('<!--[-->');

					T.Mesh($$renderer, {
						children: ($$renderer) => {
							if (T.MeshBasicMaterial) {
								$$renderer.push('<!--[-->');
								T.MeshBasicMaterial($$renderer, { color: 'red' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (T.TorusKnotGeometry) {
								$$renderer.push('<!--[-->');
								T.TorusKnotGeometry($$renderer, { args: [1, 0.25, 128] });
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
						children: ($$renderer) => {
							FakeGlowMaterial($$renderer, { glowColor: 'red' });
							$$renderer.push(`<!----> `);

							if (T.TorusKnotGeometry) {
								$$renderer.push('<!--[-->');
								T.TorusKnotGeometry($$renderer, { args: [1, 0.8, 128] });
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

	$$renderer.push(` `);

	if (T.PerspectiveCamera) {
		$$renderer.push('<!--[-->');

		T.PerspectiveCamera($$renderer, {
			makeDefault: true,
			'position.y': 8,
			'position.z': 8,
			fov: 90,
			children: ($$renderer) => {
				OrbitControls($$renderer, { enableDamping: true, enablePan: false, enableZoom: false });
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	Grid($$renderer, {
		'position.y': 0,
		sectionThickness: 1,
		infiniteGrid: true,
		cellColor: '#dddddd',
		sectionColor: '#ffffff',
		sectionSize: 10,
		cellSize: 2
	});

	$$renderer.push(`<!---->`);
}