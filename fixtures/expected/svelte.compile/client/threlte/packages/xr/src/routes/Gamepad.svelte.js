import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useGamepad } from '../../../extras/src/lib/index.js';

export default function Gamepad($$anchor, $$props) {
	$.push($$props, true);

	const leftPad = useGamepad({ xr: true, hand: 'left' });
	const rightPad = useGamepad({ xr: true, hand: 'right' });

	leftPad.on('change', (event) => console.log('left', event));
	rightPad.on('change', (event) => console.log('right', event));
	$.pop();
}