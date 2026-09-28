import * as $ from 'svelte/internal/server';
import { LightSwitch } from '$lib/components/ui/light-switch';

export default function Light_switch_variants($$renderer) {
	LightSwitch($$renderer, { variant: 'ghost' });
}