import * as $ from 'svelte/internal/server';
import { Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from 'three';
import { T, useTask } from '@threlte/core';
import { useHand } from '@threlte/xr';

export default function TouchDebug($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			joint = 'index-finger-tip',
			hoverRadius = 0.03,
			downRadius = 0.01
		} = $$props;

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
			const space = hand.current?.hand.joints[joint];

			if (space === undefined || space.jointRadius === undefined) {
				hoverMesh.visible = false;
				downMesh.visible = false;

				return;
			}

			space.updateWorldMatrix(true, false);
			origin.setFromMatrixPosition(space.matrixWorld);
			hoverMesh.position.copy(origin);
			hoverMesh.scale.setScalar(hoverRadius);
			hoverMesh.updateMatrix();
			hoverMesh.visible = true;
			downMesh.position.copy(origin);
			downMesh.scale.setScalar(downRadius);
			downMesh.updateMatrix();
			downMesh.visible = true;
		};

		useTask(() => {
			update(leftHand, leftHover, leftDown);
			update(rightHand, rightHover, rightDown);
		});

		T($$renderer, { is: leftHover });
		$$renderer.push(`<!----> `);
		T($$renderer, { is: leftDown });
		$$renderer.push(`<!----> `);
		T($$renderer, { is: rightHover });
		$$renderer.push(`<!----> `);
		T($$renderer, { is: rightDown });
		$$renderer.push(`<!---->`);
	});
}