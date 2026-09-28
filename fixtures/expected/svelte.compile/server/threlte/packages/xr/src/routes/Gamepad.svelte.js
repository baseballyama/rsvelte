import * as $ from 'svelte/internal/server';
import { useGamepad } from '../../../extras/src/lib/index.js';

export default function Gamepad($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const leftPad = useGamepad({ xr: true, hand: 'left' });
		const rightPad = useGamepad({ xr: true, hand: 'right' });

		leftPad.on('change', (event) => console.log('left', event));
		rightPad.on('change', (event) => console.log('right', event));
	});
}