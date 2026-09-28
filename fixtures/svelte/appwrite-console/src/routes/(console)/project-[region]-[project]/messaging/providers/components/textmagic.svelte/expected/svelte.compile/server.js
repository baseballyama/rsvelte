import * as $ from 'svelte/internal/server';
import { SvgIcon } from '$lib/components';

export default function Textmagic($$renderer) {
	SvgIcon($$renderer, { name: 'textmagic', type: 'color' });
}