import * as $ from 'svelte/internal/server';
import { Layer } from '$lib';

export default function ResizableLayerHandle($$renderer, $$props) {
	let { x, y, active = false, $$slots, $$events, ...eventHandlers } = $$props;

	const render = ({ context }) => {
		context.fillStyle = active ? '#111' : '#444';
		context.fillRect(x - 6, y - 6, 12, 12);
	};

	Layer($$renderer, $.spread_props([{ render }, eventHandlers]));
}