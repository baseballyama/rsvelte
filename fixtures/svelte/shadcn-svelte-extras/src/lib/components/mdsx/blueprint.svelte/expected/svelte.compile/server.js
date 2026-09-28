import * as $ from 'svelte/internal/server';

export {
	a,
	blockquote,
	h1,
	h2,
	h3,
	h4,
	h5,
	h6,
	hr,
	img,
	li,
	ol,
	p,
	pre,
	strong,
	table,
	td,
	th,
	tr,
	ul,
	figcaption
} from './index.js';

export default function Blueprint($$renderer, $$props) {
	let { title = '', description = '', source = '', component = '' } = $$props;

	$$renderer.push(`<div class="mdsx flex flex-col"><!--[-->`);
	$.slot($$renderer, $$props, 'default', { title, description, source, component }, null);
	$$renderer.push(`<!--]--></div>`);
}