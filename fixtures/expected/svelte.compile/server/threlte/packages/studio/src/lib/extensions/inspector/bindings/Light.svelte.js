import * as $ from 'svelte/internal/server';
import { Folder } from 'svelte-tweakpane-ui';
import Shadow from './Shadow.svelte';
import TransactionalBinding from './TransactionalBinding.svelte';
import { haveProperty } from './utils.js';

export default function Light($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { lights } = $$props;
		const filterUndefined = (value) => value !== undefined;

		Folder($$renderer, {
			title: 'Light',
			expanded: true,
			children: ($$renderer) => {
				TransactionalBinding($$renderer, {
					objects: lights,
					key: 'color',
					label: 'color',
					options: { color: { type: 'float' } }
				});

				$$renderer.push(`<!----> `);

				TransactionalBinding($$renderer, {
					objects: lights,
					key: 'intensity',
					label: 'intensity',
					options: { step: 0.01, min: 0 }
				});

				$$renderer.push(`<!----> `);

				if (haveProperty(lights, 'isDirectionalLight')) {
					$$renderer.push('<!--[0-->');
					TransactionalBinding($$renderer, { objects: lights, key: 'target.position', label: 'target' });
				} else if (haveProperty(lights, 'isPointLight')) {
					$$renderer.push('<!--[1-->');
					TransactionalBinding($$renderer, { objects: lights, key: 'decay', label: 'decay' });
					$$renderer.push(`<!----> `);
					TransactionalBinding($$renderer, { objects: lights, key: 'distance', label: 'distance' });
					$$renderer.push(`<!----> `);
					TransactionalBinding($$renderer, { objects: lights, key: 'power', label: 'power' });
					$$renderer.push(`<!---->`);
				} else if (haveProperty(lights, 'isSpotLight')) {
					$$renderer.push('<!--[2-->');
					TransactionalBinding($$renderer, { objects: lights, key: 'target.position', label: 'target' });
					$$renderer.push(`<!----> `);

					TransactionalBinding($$renderer, {
						objects: lights,
						key: 'angle',
						label: 'angle',
						options: { min: 0, max: Math.PI / 2 }
					});

					$$renderer.push(`<!----> `);
					TransactionalBinding($$renderer, { objects: lights, key: 'decay', label: 'decay' });
					$$renderer.push(`<!----> `);
					TransactionalBinding($$renderer, { objects: lights, key: 'distance', label: 'distance' });
					$$renderer.push(`<!----> `);

					TransactionalBinding($$renderer, {
						objects: lights,
						key: 'penumbra',
						label: 'penumbra',
						options: { min: 0, max: 1 }
					});

					$$renderer.push(`<!----> `);
					TransactionalBinding($$renderer, { objects: lights, key: 'power', label: 'power' });
					$$renderer.push(`<!---->`);
				} else if (haveProperty(lights, 'isHemisphereLight')) {
					$$renderer.push('<!--[3-->');
					TransactionalBinding($$renderer, { objects: lights, key: 'groundColor', label: 'groundColor' });
				} else if (haveProperty(lights, 'isRectAreaLight')) {
					$$renderer.push('<!--[4-->');
					TransactionalBinding($$renderer, { objects: lights, key: 'power', label: 'power' });
					$$renderer.push(`<!----> `);
					TransactionalBinding($$renderer, { objects: lights, key: 'width', label: 'width' });
					$$renderer.push(`<!----> `);
					TransactionalBinding($$renderer, { objects: lights, key: 'height', label: 'height' });
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (haveProperty(lights, 'shadow')) {
					$$renderer.push('<!--[0-->');

					Folder($$renderer, {
						expanded: false,
						title: 'Shadow',
						children: ($$renderer) => {
							Shadow($$renderer, {
								objects: lights.map((light) => light.shadow).filter(filterUndefined)
							});
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}