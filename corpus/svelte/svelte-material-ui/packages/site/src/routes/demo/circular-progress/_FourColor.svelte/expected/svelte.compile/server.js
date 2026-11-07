import * as $ from 'svelte/internal/server';
import CircularProgress from '@smui/circular-progress';

export default function _FourColor($$renderer) {
	$$renderer.push(`<div style="display: flex; justify-content: center">`);

	CircularProgress($$renderer, {
		class: 'my-four-colors',
		style: 'height: 32px; width: 32px;',
		indeterminate: true,
		fourColor: true
	});

	$$renderer.push(`<!----></div>`);
}