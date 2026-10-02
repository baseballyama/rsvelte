import * as $ from 'svelte/internal/server';
import LinearProgress from '@smui/linear-progress';

export default function _Indeterminate($$renderer) {
	LinearProgress($$renderer, { indeterminate: true });
}