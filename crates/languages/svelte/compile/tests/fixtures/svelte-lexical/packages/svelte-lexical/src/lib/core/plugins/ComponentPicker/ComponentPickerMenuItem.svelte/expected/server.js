import * as $ from 'svelte/internal/server';

export default function ComponentPickerMenuItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { index, isSelected, onclick, onmouseenter, option } = $$props;
		let className = $.derived(() => 'item' + (isSelected ? ' selected' : ''));

		$$renderer.push(`<li${$.attr('tabindex', -1)}${$.attr_class($.clsx(className()))} role="option"${$.attr('aria-selected', isSelected)}${$.attr('id', 'typeahead-item-' + index)}><i${$.attr_class($.clsx(option.icon))}></i> <span class="text">${$.escape(option.title)}</span></li>`);
	});
}