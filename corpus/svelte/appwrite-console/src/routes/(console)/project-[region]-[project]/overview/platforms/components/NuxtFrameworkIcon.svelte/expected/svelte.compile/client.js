import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvgIcon } from '$lib/components';

export default function NuxtFrameworkIcon($$anchor) {
	SvgIcon($$anchor, { name: 'nuxt', type: 'color' });
}