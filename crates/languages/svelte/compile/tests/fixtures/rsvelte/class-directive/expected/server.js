import * as $ from 'svelte/internal/server';

export default function Class_directive($$renderer) {
	let active = false;
	let count = 0;
	let theme = 'light';
	const flag = true;
	function even(n) {
		return n % 2 === 0;
	}
	$$renderer.push(`<div${$.attr_class('', void 0, { 'active': active })}>shorthand</div> <div${$.attr_class('panel', void 0, { 'active': active, 'is-large': count > 3 })}>with class</div> <div${$.attr_class($.clsx(theme), void 0, { 'active': !active })}>with expression</div> <div${$.attr_class('', void 0, { 'even': even(count), 'odd': !even(count) })}>calls</div> <div${$.attr_class('', void 0, { 'fixed': flag })}>static</div> <div${$.attr_class('a light', void 0, { 'b': active })}>interpolated</div> <button>${$.escape(count)}</button> <button>toggle</button>`);
}
