import * as $ from 'svelte/internal/server';
import CircularProgress from '@smui/circular-progress';

export default function _Indeterminate($$renderer) {
	$$renderer.push(`<div style="display: flex; justify-content: center">`);
	CircularProgress($$renderer, { style: 'height: 32px; width: 32px;', indeterminate: true });
	$$renderer.push(`<!----></div>`);
}