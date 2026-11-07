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
} from "./index.js";

var root = $.from_html(`<div class="mdsx"><!></div>`);

export default function Blueprint($$anchor, $$props) {
	var div = root();
	var node = $.child(div);

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
			},

			get source() {
				return $$props.source;
			},

			get component() {
				return $$props.component;
			}
		},
		null
	);

	$.reset(div);
	$.append($$anchor, div);
}