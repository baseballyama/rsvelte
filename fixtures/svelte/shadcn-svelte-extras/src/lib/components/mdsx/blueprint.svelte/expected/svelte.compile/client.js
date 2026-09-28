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
	strong,
	table,
	td,
	th,
	tr,
	ul,
	figcaption
} from './index.js';

var root = $.from_html(`<div class="mdsx flex flex-col"><!></div>`);

export default function Blueprint($$anchor, $$props) {
	let title = $.prop($$props, 'title', 3, ''),
		description = $.prop($$props, 'description', 3, ''),
		source = $.prop($$props, 'source', 3, ''),
		component = $.prop($$props, 'component', 3, '');

	var div = root();
	var node = $.child(div);

	$.slot(
		node,
		$$props,
		'default',
		{
			get title() {
				return title();
			},

			get description() {
				return description();
			},

			get source() {
				return source();
			},

			get component() {
				return component();
			}
		},
		null
	);

	$.reset(div);
	$.append($$anchor, div);
}