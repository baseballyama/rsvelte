import * as $ from 'svelte/internal/server';
import { SvgIcon } from '$lib/components';

export default function ReactFrameworkIcon($$renderer) {
	SvgIcon($$renderer, { name: 'react', type: 'color' });
}