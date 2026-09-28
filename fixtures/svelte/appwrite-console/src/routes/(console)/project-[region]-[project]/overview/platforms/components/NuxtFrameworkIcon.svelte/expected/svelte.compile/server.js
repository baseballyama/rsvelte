import * as $ from 'svelte/internal/server';
import { SvgIcon } from '$lib/components';

export default function NuxtFrameworkIcon($$renderer) {
	SvgIcon($$renderer, { name: 'nuxt', type: 'color' });
}