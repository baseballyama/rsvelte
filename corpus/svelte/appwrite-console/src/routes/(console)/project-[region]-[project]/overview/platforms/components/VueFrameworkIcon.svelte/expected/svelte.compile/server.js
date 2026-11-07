import * as $ from 'svelte/internal/server';
import { SvgIcon } from '$lib/components';

export default function VueFrameworkIcon($$renderer) {
	SvgIcon($$renderer, { name: 'vue', type: 'color' });
}