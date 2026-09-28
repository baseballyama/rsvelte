import * as $ from 'svelte/internal/server';
import { useFixedJoint } from '@threlte/rapier';

export default function FixedJoint($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { bodyA, bodyB, anchorA, anchorB } = $$props;
		const { rigidBodyA, rigidBodyB } = useFixedJoint(anchorA, [0, 0, 0], anchorB, [0, 0, 0]);
	});
}