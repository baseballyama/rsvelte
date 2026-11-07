import * as $ from 'svelte/internal/server';
import { BoxGeometry, CylinderGeometry, MeshStandardMaterial } from 'three';
import Windmill from './Windmill.svelte';
import { windmills } from './gameState.svelte';

const barGeometry = new BoxGeometry(0.9, 0.07, 0.25);

const barMaterial = new MeshStandardMaterial({
	color: '#ff5fa2',
	metalness: 0.6,
	roughness: 0.3,
	emissive: '#ff2266',
	emissiveIntensity: 0.6
});

const hubGeometry = new CylinderGeometry(0.08, 0.08, 0.32, 14);

const hubMaterial = new MeshStandardMaterial({
	color: '#fff0c0',
	metalness: 0.9,
	roughness: 0.18,
	emissive: '#ffaa00',
	emissiveIntensity: 0.7
});

export default function Windmills($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(windmills);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let windmill = each_array[$$index];

			Windmill($$renderer, {
				position: windmill.position,
				initialAngularVelocity: windmill.spin,
				barGeometry,
				barMaterial,
				hubGeometry,
				hubMaterial
			});
		}

		$$renderer.push(`<!--]-->`);
	});
}