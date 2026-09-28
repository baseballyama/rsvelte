import * as $ from 'svelte/internal/server';
import QR from '@svelte-put/qr/svg/QR.svelte';

export default function Svg_component($$renderer) {
	QR($$renderer, {
		data: 'https://svelte-put.vnphanquang.com/docs/qr',
		moduleFill: 'violet',
		anchorOuterFill: 'red',
		anchorInnerFill: 'violet'
	});
}