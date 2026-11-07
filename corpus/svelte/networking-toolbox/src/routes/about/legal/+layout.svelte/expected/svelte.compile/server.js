import * as $ from 'svelte/internal/server';
import '../../../styles/pages.scss';

export default function _layout($$renderer, $$props) {
	$$renderer.push(`<div class="legal-page svelte-ljn3jp"><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></div>`);
}