import * as $ from 'svelte/internal/server';

export default function Class_expression($$renderer) {
	let active = false;
	let size = 'small';
	let tone = null;
	const base = 'card';
	function variant(v) {
		return `btn-${v}`;
	}
	$$renderer.push(`<div${$.attr_class($.clsx(size))}>expression</div> <div${$.attr_class(`box ${$.stringify(size)} rounded`)}>interpolated</div> <div${$.attr_class(size)}>quoted</div> <div${$.attr_class($.clsx({ active, large: size === 'large' }))}>object</div> <div${$.attr_class($.clsx(['item', active && 'is-active', tone]))}>array</div> <div${$.attr_class($.clsx(base))}>constant</div> <div class="literal">literal</div> <div${$.attr_class(`t-${size}`)}>template</div> <div${$.attr_class($.clsx(variant(size)))}>call</div> <button>toggle</button> <button>resize</button>`);
}
