import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { Portal } from '@threlte/extras';
import { Group, PerspectiveCamera, Vector3 } from 'three';

var root = $.from_html(`<!> <!>`, 1);

export default function FollowCamera($$anchor, $$props) {
	$.push($$props, true);

	const vector3 = new Vector3();
	let initial = false;
	let group = new Group();
	let camera = new PerspectiveCamera();

	useTask(() => {
		group.getWorldPosition(vector3);
		vector3.z = camera.position.z;

		if (!initial) {
			initial = true;
			camera.position.copy(vector3);
		} else {
			camera.position.lerp(vector3, 0.05);
		}
	});

	var fragment = root();
	var node = $.first_child(fragment);

	T(node, {
		get is() {
			return group;
		}
	});

	var node_1 = $.sibling(node, 2);

	Portal(node_1, {
		id: 'scene',
		children: ($$anchor, $$slotProps) => {
			T($$anchor, {
				get is() {
					return camera;
				},
				makeDefault: true,
				position: [0, 0, 10]
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}