import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useFixedJoint } from '@threlte/rapier';

export default function FixedJoint($$anchor, $$props) {
	$.push($$props, true);

	const { rigidBodyA, rigidBodyB } = useFixedJoint($$props.anchorA, [0, 0, 0], $$props.anchorB, [0, 0, 0]);

	$.user_effect(() => {
		rigidBodyA.set($$props.bodyA);
		rigidBodyB.set($$props.bodyB);
	});

	$.pop();
}