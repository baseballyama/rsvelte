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
	table,
	td,
	th,
	tr,
	ul
} from "$lib/components/markdown/index.js";

export default function Blueprint($$renderer, $$props) {
	let { title, description } = $$props;

	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', { title, description }, null);
	$$renderer.push(`<!--]-->`);
}