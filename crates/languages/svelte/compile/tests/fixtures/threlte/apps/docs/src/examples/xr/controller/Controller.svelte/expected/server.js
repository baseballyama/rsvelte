import * as $ from 'svelte/internal/server';

import {
	Vector3,
	Matrix4,
	Color,
	InstancedMesh,
	IcosahedronGeometry,
	MeshPhongMaterial
} from 'three';

import { T, useTask } from '@threlte/core';
import { Text } from '@threlte/extras';
import { Controller, useController } from '@threlte/xr';

export default function Controller_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...props } = $$props;
		let controllerState = 'disconnected';
		let cursor = 0;
		let text = '';
		const count = 100;
		const positions = new Float32Array(count * 3);
		const velocities = new Float32Array(count * 3);
		const vec3 = new Vector3();
		const matrix = new Matrix4();
		const color = new Color();
		const controller = useController('left' in props ? 'left' : 'right');
		const instancedMesh = new InstancedMesh(new IcosahedronGeometry(0.01), new MeshPhongMaterial(), count);

		const colorMap = {
			connected: 'green',
			disconnected: 'crimson',
			selectstart: 'darkorchid',
			selectend: 'darkmagenta',
			select: 'darkmagenta',
			squeezestart: 'lightcoral',
			squeezeend: 'indianred',
			squeeze: 'indianred',
			pinchstart: 'lightcyan',
			pinchend: 'lightblue'
		};

		const handleEvent = (event) => {
			text = `${event.data.handedness} ${event.type}`;
			controllerState = event.type;
		};

		const fireParticle = () => {
			instancedMesh.setColorAt(cursor, color.setStyle(colorMap[controllerState]));
			instancedMesh.instanceColor.needsUpdate = true;

			let i = cursor * 3;
			const ray = controller.current?.targetRay;

			ray?.getWorldDirection(vec3).negate().multiplyScalar(0.015);
			vec3.x += (Math.random() - 0.5) * 0.012;
			vec3.y += (Math.random() - 0.5) * 0.012;
			vec3.z += (Math.random() - 0.5) * 0.012;

			const { x = 0, y = 0, z = 0 } = ray?.position ?? {};

			positions[i] = x;
			positions[i + 1] = y;
			positions[i + 2] = z;
			velocities[i] = vec3.x;
			velocities[i + 1] = vec3.y;
			velocities[i + 2] = vec3.z;
			cursor += 1;
			cursor %= count;
		};

		useTask(() => {
			for (let i = 0, j = 0; i < count; (i += 1, j += 3)) {
				positions[j + 0] += velocities[j];
				positions[j + 1] += velocities[j + 1];
				positions[j + 2] += velocities[j + 2];
				matrix.setPosition(positions[j], positions[j + 1], positions[j + 2]);
				instancedMesh.setMatrixAt(i, matrix);
			}

			instancedMesh.instanceMatrix.needsUpdate = true;

			switch (controllerState) {
				case 'squeezestart':

				case 'selectstart':
					return fireParticle();
			}
		});

		{
			function targetRay($$renderer) {
				Text($$renderer, { anchorX: 'center', fontSize: 0.05, text, 'position.y': 0.2 });
			}

			Controller($$renderer, $.spread_props([
				{
					onconnected: handleEvent,
					ondisconnected: handleEvent,
					onselectstart: handleEvent,
					onselectend: handleEvent,
					onselect: handleEvent,
					onsqueezestart: handleEvent,
					onsqueezeend: handleEvent,
					onsqueeze: handleEvent
				},
				props,
				{ targetRay, $$slots: { targetRay: true } }
			]));
		}

		$$renderer.push(`<!----> `);
		T($$renderer, { is: instancedMesh, frustumCulled: false });
		$$renderer.push(`<!---->`);
	});
}