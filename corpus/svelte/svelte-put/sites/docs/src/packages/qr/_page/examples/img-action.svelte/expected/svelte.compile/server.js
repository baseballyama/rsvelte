import * as $ from 'svelte/internal/server';
import { qr } from '@svelte-put/qr/img';

export default function Img_action($$renderer) {
	$$renderer.push(`<img alt="qr" onload="this.__e=event" onerror="this.__e=event"/>`);
}