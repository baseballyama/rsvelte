import * as $ from 'svelte/internal/server';
import '@picocss/pico/css/pico.css';
import '@picocss/pico/docs/css/pico.docs.css';
import '../_variables.scss';

export default function __layout($$renderer, $$props) {
	$$renderer.push(`<div class="container"><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></div>`);
}