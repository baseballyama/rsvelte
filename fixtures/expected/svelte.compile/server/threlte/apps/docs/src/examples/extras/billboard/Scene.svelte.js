import * as $ from 'svelte/internal/server';
import { OrbitControls, Grid, Billboard } from '@threlte/extras';
import { T } from '@threlte/core';

export default function Scene($$renderer, $$props) {
	let { follow = true } = $$props;

	Billboard($$renderer, {
		follow,
		position: [3, 1, 0],
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

						if (T.PlaneGeometry) {
							$$renderer.push('<!--[-->');
							T.PlaneGeometry($$renderer, { args: [2, 3] });
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

	$$renderer.push(`<!----> `);

	Billboard($$renderer, {
		follow,
		position: [-4, 3, 0],
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

						if (T.PlaneGeometry) {
							$$renderer.push('<!--[-->');
							T.PlaneGeometry($$renderer, { args: [3, 2] });
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

	$$renderer.push(`<!----> `);

	Billboard($$renderer, {
		follow,
		position: [-1, 5, 2],
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

						if (T.PlaneGeometry) {
							$$renderer.push('<!--[-->');
							T.PlaneGeometry($$renderer, { args: [2, 2] });
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

	$$renderer.push(`<!----> `);

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