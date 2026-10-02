import * as $ from 'svelte/internal/server';
import { Folder, Textarea } from 'svelte-tweakpane-ui';
import { useObjectSelection } from '../object-selection/useObjectSelection.svelte.js';
import Camera from './bindings/Camera.svelte';
import Light from './bindings/Light.svelte';
import Material from './bindings/Material.svelte';
import Object3DBinding from './bindings/Object3D.svelte';
import { areCamera, areLight, haveMaterialProperty } from './bindings/utils.js';

export default function Bindings($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const objectSelection = useObjectSelection();

		const keyFromObjects = (objects) => {
			return objects.map((object) => object.uuid).join();
		};

		const firstObjectUserData = $.derived(() => JSON.stringify(objectSelection.selectedObjects[0].userData, null, 2));
		const objects = $.derived(() => objectSelection.selectedObjects);

		if (objects().length) {
			$$renderer.push(`<!--[0--><!---->`);

			{
				Object3DBinding($$renderer, { objects: objects() });
				$$renderer.push(`<!----> `);

				if (areCamera(objects())) {
					$$renderer.push('<!--[0-->');

					Folder($$renderer, {
						title: 'Camera',
						expanded: true,
						children: ($$renderer) => {
							Camera($$renderer, { objects: objects() });
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (haveMaterialProperty(objects())) {
					$$renderer.push('<!--[0-->');
					Material($$renderer, { objects: objects() });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (areLight(objects())) {
					$$renderer.push('<!--[0-->');
					Light($$renderer, { lights: objects() });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (firstObjectUserData()) {
			$$renderer.push('<!--[0-->');

			Folder($$renderer, {
				title: 'User Data',
				expanded: false,
				children: ($$renderer) => {
					Textarea($$renderer, { value: firstObjectUserData(), disabled: true, rows: 5 });
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}