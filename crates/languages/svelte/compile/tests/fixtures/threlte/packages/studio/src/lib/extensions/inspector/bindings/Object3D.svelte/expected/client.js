import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Object3D } from 'three';
import { DEG2RAD, RAD2DEG } from 'three/src/math/MathUtils.js';
import { useSnapping } from '../../snapping/useSnapping.svelte.js';
import TransactionalBinding from './TransactionalBinding.svelte';
import { haveProperty } from './utils.js';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Object3D_1($$anchor, $$props) {
	$.push($$props, true);

	const snapping = useSnapping();
	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			TransactionalBinding($$anchor, {
				get objects() {
					return $$props.objects;
				},
				key: 'visible',
				label: 'visible'
			});
		};

		var d = $.derived(() => haveProperty($$props.objects, 'visible'));

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => ({ step: snapping.enabled ? snapping.translate : undefined }));

		TransactionalBinding(node_1, {
			get objects() {
				return $$props.objects;
			},
			key: 'position',
			label: 'position',
			autoUpdate: true,
			get options() {
				return $.get($0);
			}
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => ({
			format: (n) => `${n}°`,
			step: snapping.enabled ? snapping.rotate : undefined
		}));

		TransactionalBinding(node_2, {
			get objects() {
				return $$props.objects;
			},
			key: 'rotation',
			label: 'rotation',
			autoUpdate: true,
			transform: {
				read(value) {
					return value.set(value.x * RAD2DEG, value.y * RAD2DEG, value.z * RAD2DEG);
				},

				write(value) {
					return value.set(value.x * DEG2RAD, value.y * DEG2RAD, value.z * DEG2RAD);
				}
			},

			get options() {
				return $.get($0);
			}
		});
	}

	var node_3 = $.sibling(node_2, 2);

	TransactionalBinding(node_3, {
		get objects() {
			return $$props.objects;
		},
		key: 'scale',
		label: 'scale',
		autoUpdate: true
	});

	var node_4 = $.sibling(node_3, 2);

	{
		var consequent_1 = ($$anchor) => {
			TransactionalBinding($$anchor, {
				get objects() {
					return $$props.objects;
				},
				key: 'castShadow',
				label: 'castShadow'
			});
		};

		var d_1 = $.derived(() => haveProperty($$props.objects, 'isMesh') || haveProperty($$props.objects, 'isPointLight') || haveProperty($$props.objects, 'isSpotLight') || haveProperty($$props.objects, 'isDirectionalLight'));

		$.if(node_4, ($$render) => {
			if ($.get(d_1)) $$render(consequent_1);
		});
	}

	var node_5 = $.sibling(node_4, 2);

	{
		var consequent_2 = ($$anchor) => {
			TransactionalBinding($$anchor, {
				get objects() {
					return $$props.objects;
				},
				key: 'receiveShadow',
				label: 'receiveShadow'
			});
		};

		var d_2 = $.derived(() => haveProperty($$props.objects, 'isMesh'));

		$.if(node_5, ($$render) => {
			if ($.get(d_2)) $$render(consequent_2);
		});
	}

	var node_6 = $.sibling(node_5, 2);

	TransactionalBinding(node_6, {
		get objects() {
			return $$props.objects;
		},
		key: 'frustumCulled',
		label: 'frustumCulled'
	});

	var node_7 = $.sibling(node_6, 2);

	TransactionalBinding(node_7, {
		get objects() {
			return $$props.objects;
		},
		key: 'matrixAutoUpdate',
		label: 'matrixAutoUpdate'
	});

	var node_8 = $.sibling(node_7, 2);

	TransactionalBinding(node_8, {
		get objects() {
			return $$props.objects;
		},
		key: 'matrixWorldAutoUpdate',
		label: 'matrixWorldAutoUpdate'
	});

	var node_9 = $.sibling(node_8, 2);

	TransactionalBinding(node_9, {
		get objects() {
			return $$props.objects;
		},
		key: 'renderOrder',
		label: 'renderOrder',
		options: { step: 1 }
	});

	$.append($$anchor, fragment);
	$.pop();
}