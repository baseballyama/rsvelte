import * as $ from 'svelte/internal/server';
import { foo } from '../shared-comp.svelte';
import { bar } from '../shared-ts-file';

export default function Different_ts_service($$renderer) {
	foo;
	bar;
}