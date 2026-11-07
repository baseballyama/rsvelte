import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<span title="&quot;foo&quot;">foo <span title="&quot;bar&quot;">bar</span></span>`);
}