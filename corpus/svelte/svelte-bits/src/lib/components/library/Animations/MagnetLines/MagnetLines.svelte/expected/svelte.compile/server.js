import * as $ from 'svelte/internal/server';

export default function MagnetLines($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			rows = 9,
			columns = 9,
			containerSize = '80vmin',
			lineColor = '#efefef',
			lineWidth = '1vmin',
			lineHeight = '6vmin',
			baseAngle = -10,
			class: className = '',
			style = ''
		} = $$props;

		let container;
		const total = $.derived(() => rows * columns);

		$$renderer.push(`<div${$.attr_class(`grid place-items-center ${$.stringify(className)}`)}${$.attr_style(`grid-template-columns:repeat(${$.stringify(columns)},1fr);grid-template-rows:repeat(${$.stringify(rows)},1fr);width:${$.stringify(containerSize)};height:${$.stringify(containerSize)};${$.stringify(style)}`)}><!--[-->`);

		const each_array = $.ensure_array_like(Array(total()));

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let _ = each_array[i];

			$$renderer.push(`<span class="block origin-center"${$.attr_style(`background-color:${$.stringify(lineColor)};width:${$.stringify(lineWidth)};height:${$.stringify(lineHeight)};--rotate:${$.stringify(baseAngle)}deg;transform:rotate(var(--rotate));will-change:transform;`)}></span>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}