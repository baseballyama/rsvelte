import * as $ from 'svelte/internal/server';

export default function Tabs($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { options = [], value = "", type = "top", css = "", onchange } = $$props;

		$$renderer.push(`<div${$.attr_class(`wx-tabs wx-${$.stringify(type)} ${$.stringify(css)}`, 'svelte-n0xhas')}><!--[-->`);

		const each_array = $.ensure_array_like(options);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let option = each_array[$$index];

			$$renderer.push(`<button${$.attr('title', option.title)}${$.attr('data-tooltip-text', option.tooltip)}${$.attr_class('svelte-n0xhas', void 0, { 'wx-active': option.id == value })}>`);

			if (option.icon) {
				$$renderer.push(`<!--[0--><i${$.attr_class(`wx-icon ${$.stringify(option.icon)} ${!option.label ? 'wx-only' : ''}`, 'svelte-n0xhas')}></i>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (option.label) {
				$$renderer.push(`<!--[0--><span class="wx-label svelte-n0xhas">${$.escape(option.label)}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></button>`);
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { value });
	});
}