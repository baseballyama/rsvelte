import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

export default function Blueprint($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
}