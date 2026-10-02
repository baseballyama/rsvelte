import * as $ from 'svelte/internal/server';

export default function Segmented($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { options = [], value = "", css = "", children, onchange } = $$props;

		function handleClick(id) {
			value = id;
			onchange && onchange({ value });
		}

		$$renderer.push(`<div${$.attr_class(`wx-segmented ${css}`, 'svelte-rsvny4')}><!--[-->`);

		const each_array = $.ensure_array_like(options);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let option = each_array[$$index];

			$$renderer.push(`<button${$.attr('css', option.css)}${$.attr('title', option.title)}${$.attr('data-tooltip-text', option.tooltip)}${$.attr_class('svelte-rsvny4', void 0, { 'wx-selected': option.id == value })}>`);

			if (children) {
				$$renderer.push('<!--[0-->');
				children($$renderer, { option });
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');

				if (option.icon) {
					$$renderer.push(`<!--[0--><i${$.attr_class(`wx-icon ${$.stringify(option.icon)} ${!option.label ? 'wx-only' : ''}`, 'svelte-rsvny4')}></i>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (option.label) {
					$$renderer.push(`<!--[0--><span class="wx-label svelte-rsvny4">${$.escape(option.label)}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></button>`);
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { value });
	});
}