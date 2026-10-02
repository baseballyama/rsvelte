import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TransactionalList from './TransactionalList.svelte';
import TransactionalBinding from './TransactionalBinding.svelte';
import { haveProperty } from './utils.js';
import { Folder } from 'svelte-tweakpane-ui';
import Camera from './Camera.svelte';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Shadow($$anchor, $$props) {
	$.push($$props, true);

	const keys = ['autoUpdate', 'bias', 'blurSamples', 'normalBias', 'radius'];

	const getCameras = (lightShadows) => {
		return lightShadows.map((lightShadow) => lightShadow.camera).filter((camera) => 'isPerspectiveCamera' in camera || 'isOrthographicCamera' in camera);
	};

	var fragment = root();
	var node = $.first_child(fragment);

	TransactionalList(node, {
		get objects() {
			return $$props.objects;
		},
		key: 'mapSize.width',
		label: 'mapSize.width',
		options: {
			128: 128,
			256: 256,
			512: 512,
			1024: 1024,
			2048: 2048,
			4096: 4096
		},
		$$events: {
			change: () => {
				$$props.objects.forEach((object) => {
					object.dispose();
					object.map = null;
				});
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	TransactionalList(node_1, {
		get objects() {
			return $$props.objects;
		},
		key: 'mapSize.height',
		label: 'mapSize.height',
		options: {
			128: 128,
			256: 256,
			512: 512,
			1024: 1024,
			2048: 2048,
			4096: 4096
		},
		$$events: {
			change: () => {
				$$props.objects.forEach((object) => {
					object.dispose();
					object.map = null;
				});
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	$.each(node_2, 16, () => keys, (key) => key, ($$anchor, key) => {
		TransactionalBinding($$anchor, {
			get objects() {
				return $$props.objects;
			},

			get key() {
				return key;
			},

			get label() {
				return key;
			}
		});
	});

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent = ($$anchor) => {
			const cameras = $.derived(() => getCameras($$props.objects));

			Folder($$anchor, {
				title: 'Shadow Camera',
				expanded: false,
				children: ($$anchor, $$slotProps) => {
					Camera($$anchor, {
						get objects() {
							return $.get(cameras);
						}
					});
				},
				$$slots: { default: true }
			});
		};

		var d = $.derived(() => haveProperty($$props.objects, 'camera'));

		$.if(node_3, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}