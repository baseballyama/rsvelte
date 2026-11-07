import * as $ from 'svelte/internal/server';
import { SvgIcon } from '$lib/components';

export default function Apple($$renderer) {
	SvgIcon($$renderer, { name: 'apple', type: 'color' });
}