import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

export default function Blueprint($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(
		node,
		$$props,
		'default',
		{
			get title() {
				return $$props.title;
			},

			get description() {
				return $$props.description;
			}
		},
		null
	);

	$.append($$anchor, fragment);
}