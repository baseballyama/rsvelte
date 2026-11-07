import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip.js';

export default function SegmentedControl($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			options,
			value = void 0,
			onchange,
			class: className = '',
			hideLabel = false
		} = $$props;

		let buttonsContainer;

		// Track the active indicator position and width
		let indicatorStyle = '';

		// Check if all options have icons
		const allHaveIcons = $.derived(() => options.every((opt) => opt.icon));

		const shouldHideLabel = $.derived(() => hideLabel && allHaveIcons());

		// Update indicator position when value or hideLabel changes
		// Use requestAnimationFrame to ensure DOM has updated after hideLabel changes
		function updateIndicator(button) {
			if (!buttonsContainer) return;

			const containerRect = buttonsContainer.getBoundingClientRect();
			const buttonRect = button.getBoundingClientRect();
			const left = buttonRect.left - containerRect.left;
			const width = buttonRect.width;

			indicatorStyle = `transform: translateX(${left}px); width: ${width}px;`;
		}

		function handleClick(option) {
			value = option.value;

			if (option.href) {
				goto(option.href);
			} else if (onchange) {
				onchange(option.value);
			}
		}

		$$renderer.push(`<div${$.attr_class(`segmented-control ${$.stringify(className)}`, 'svelte-j9qfmp')}><div class="buttons-container svelte-j9qfmp"><div class="active-indicator svelte-j9qfmp"${$.attr_style(indicatorStyle)}></div> <!--[-->`);

		const each_array = $.ensure_array_like(options);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let option = each_array[$$index];

			$$renderer.push(`<button${$.attr_class('segment-btn svelte-j9qfmp', void 0, {
				'active': value === option.value,
				'icon-only': shouldHideLabel() && option.icon
			})}${$.attr('aria-pressed', value === option.value)}>`);

			if (option.icon) {
				$$renderer.push('<!--[0-->');
				Icon($$renderer, { name: option.icon, size: 'sm' });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (!shouldHideLabel()) {
				$$renderer.push(`<!--[0--><span class="segment-label">${$.escape(option.label)}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></button>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
		$.bind_props($$props, { value });
	});
}