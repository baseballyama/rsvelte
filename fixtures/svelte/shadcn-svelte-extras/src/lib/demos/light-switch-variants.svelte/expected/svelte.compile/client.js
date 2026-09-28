import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LightSwitch } from '$lib/components/ui/light-switch';

export default function Light_switch_variants($$anchor) {
	LightSwitch($$anchor, { variant: 'ghost' });
}