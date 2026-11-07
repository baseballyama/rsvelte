import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { foo } from './shared-comp.svelte';
import { bar } from './shared-ts-file';

export default function Different_ts_service($$anchor) {
	foo;
	bar;
}