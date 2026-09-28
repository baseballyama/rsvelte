import * as $ from 'svelte/internal/server';
import { SvgIcon } from '$lib/components';

export default function SvelteFrameworkIcon($$renderer) {
	SvgIcon($$renderer, { name: 'svelte', type: 'color' });
}