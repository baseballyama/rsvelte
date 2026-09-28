import * as $ from 'svelte/internal/server';
import "carbon-components-svelte/css/white.css";

export default function _layout($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}