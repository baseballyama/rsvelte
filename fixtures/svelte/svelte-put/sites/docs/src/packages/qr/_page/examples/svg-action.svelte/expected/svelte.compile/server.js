import * as $ from 'svelte/internal/server';
import { qr } from '@svelte-put/qr/svg';

export default function Svg_action($$renderer) {
	$$renderer.push(`<svg></svg>`);
}