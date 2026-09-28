import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { bgColor } from './store.js';
import './style/style.css';
import './style/code.css';

var root = $.from_html(`<div><!></div>`);

export default function _layout($$anchor, $$props) {
	const $bgColor = () => $.store_get(bgColor, '$bgColor', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	var /** children */
	div = root();

	let styles;
	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.template_effect(() => styles = $.set_style(div, '', styles, { padding: '8px', 'background-color': $bgColor() }));
	$.append($$anchor, div);
	$$cleanup();
}