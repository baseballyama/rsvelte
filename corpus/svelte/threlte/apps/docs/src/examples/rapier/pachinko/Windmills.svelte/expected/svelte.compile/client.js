import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Windmills($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => windmills, (windmill) => windmill, ($$anchor, windmill) => {
		Windmill($$anchor, {
			get position() {
				return windmill.position;
			},

			get initialAngularVelocity() {
				return windmill.spin;
			},

			get barGeometry() {
				return barGeometry;
			},

			get barMaterial() {
				return barMaterial;
			},

			get hubGeometry() {
				return hubGeometry;
			},

			get hubMaterial() {
				return hubMaterial;
			}
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}