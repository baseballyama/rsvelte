import * as $ from 'svelte/internal/server';
import TransactionalList from './TransactionalList.svelte';
import TransactionalBinding from './TransactionalBinding.svelte';
import { haveProperty } from './utils.js';
import { Folder } from 'svelte-tweakpane-ui';
import Camera from './Camera.svelte';

export default function Shadow($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { objects } = $$props;
		const keys = ['autoUpdate', 'bias', 'blurSamples', 'normalBias', 'radius'];

		const getCameras = (lightShadows) => {
			return lightShadows.map((lightShadow) => lightShadow.camera).filter((camera) => 'isPerspectiveCamera' in camera || 'isOrthographicCamera' in camera);
		};

		TransactionalList($$renderer, {
			objects,
			key: 'mapSize.width',
			label: 'mapSize.width',
			options: {
				128: 128,
				256: 256,
				512: 512,
				1024: 1024,
				2048: 2048,
				4096: 4096
			}
		});

		$$renderer.push(`<!----> `);

		TransactionalList($$renderer, {
			objects,
			key: 'mapSize.height',
			label: 'mapSize.height',
			options: {
				128: 128,
				256: 256,
				512: 512,
				1024: 1024,
				2048: 2048,
				4096: 4096
			}
		});

		$$renderer.push(`<!----> <!--[-->`);

		const each_array = $.ensure_array_like(keys);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let key = each_array[$$index];

			TransactionalBinding($$renderer, { objects, key, label: key });
		}

		$$renderer.push(`<!--]--> `);

		if (haveProperty(objects, 'camera')) {
			$$renderer.push('<!--[0-->');

			const cameras = getCameras(objects);

			Folder($$renderer, {
				title: 'Shadow Camera',
				expanded: false,
				children: ($$renderer) => {
					Camera($$renderer, { objects: cameras });
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}