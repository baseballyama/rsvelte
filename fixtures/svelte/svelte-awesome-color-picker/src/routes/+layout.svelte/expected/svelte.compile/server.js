import * as $ from 'svelte/internal/server';
import { bgColor } from './store.js';
import './style/style.css';
import './style/code.css';

export default function _layout($$renderer, $$props) {
	var $$store_subs;

	/** children */
	let { children } = $$props;

	$$renderer.push(`<div${$.attr_style('', {
		padding: '8px',
		'background-color': $.store_get($$store_subs ??= {}, '$bgColor', bgColor)
	})}>`);

	children($$renderer);
	$$renderer.push(`<!----></div>`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}