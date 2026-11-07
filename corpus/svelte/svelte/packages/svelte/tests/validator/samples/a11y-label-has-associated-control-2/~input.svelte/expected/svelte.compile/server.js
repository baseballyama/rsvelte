import * as $ from 'svelte/internal/server';
import Component from './component.svelte';

export default function Input($$renderer, $$props) {
	$$renderer.push(`<label><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></label> <label>`);
	Component($$renderer, {});
	$$renderer.push(`<!----></label>`);
}