import * as $ from 'svelte/internal/server';

export {
	a,
	blockquote,
	code,
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
} from '@svecodocs/kit';

export default function Blueprint($$renderer, $$props) {
	let { children } = $$props;

	children?.($$renderer);
	$$renderer.push(`<!---->`);
}