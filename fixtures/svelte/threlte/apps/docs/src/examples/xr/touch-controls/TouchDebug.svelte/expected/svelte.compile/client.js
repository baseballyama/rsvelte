import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from 'three';
import { T, useTask } from '@threlte/core';
import { useHand } from '@threlte/xr';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function TouchDebug($$anchor, $$props) {
	$.push($$props, true);

	const joint = $.prop($$props, 'joint', 3, 'index-finger-tip'),
		hoverRadius = $.prop($$props, 'hoverRadius', 3, 0.03),
		downRadius = $.prop($$props, 'downRadius', 3, 0.01);

	const leftHand = useHand('left');
	const rightHand = useHand('right');
	const sphereGeometry = new SphereGeometry(1, 16, 12);

	const hoverMaterial = new MeshBasicMaterial({
		color: '#facc15',
		wireframe: true,
		transparent: true,
		opacity: 0.3
	});

	const downMaterial = new MeshBasicMaterial({
		color: '#ef4444',
		wireframe: true,
		transparent: true,
		opacity: 0.5
	});

	const createSphere = (material) => {
		const mesh = new Mesh(sphereGeometry, material);

		mesh.matrixAutoUpdate = false;
		mesh.visible = false;

		return mesh;
	};

	const leftHover = createSphere(hoverMaterial);
	const leftDown = createSphere(downMaterial);
	const rightHover = createSphere(hoverMaterial);
	const rightDown = createSphere(downMaterial);
	const origin = new Vector3();

	const update = (hand, hoverMesh, downMesh) => {
		const space = hand.current?.hand.joints[joint()];

		if (space === undefined || space.jointRadius === undefined) {
			hoverMesh.visible = false;
			downMesh.visible = false;

			return;
		}

		space.updateWorldMatrix(true, false);
		origin.setFromMatrixPosition(space.matrixWorld);
		hoverMesh.position.copy(origin);
		hoverMesh.scale.setScalar(hoverRadius());
		hoverMesh.updateMatrix();
		hoverMesh.visible = true;
		downMesh.position.copy(origin);
		downMesh.scale.setScalar(downRadius());
		downMesh.updateMatrix();
		downMesh.visible = true;
	};

	useTask(() => {
		update(leftHand, leftHover, leftDown);
		update(rightHand, rightHover, rightDown);
	});

	var fragment = root();
	var node = $.first_child(fragment);

	T(node, {
		get is() {
			return leftHover;
		}
	});

	var node_1 = $.sibling(node, 2);

	T(node_1, {
		get is() {
			return leftDown;
		}
	});

	var node_2 = $.sibling(node_1, 2);

	T(node_2, {
		get is() {
			return rightHover;
		}
	});

	var node_3 = $.sibling(node_2, 2);

	T(node_3, {
		get is() {
			return rightDown;
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}