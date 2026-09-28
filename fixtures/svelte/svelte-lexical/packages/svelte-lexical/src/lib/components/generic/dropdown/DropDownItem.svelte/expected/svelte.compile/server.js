import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { getRegisterItemFunc } from './utils.js';

export default function DropDownItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			title = undefined,
			ariaLabel = undefined,
			onclick,
			children
		} = $$props;

		let ref = void 0;
		const registerItem = getRegisterItemFunc();

		if (registerItem === null) {
			throw new Error('DropDownItem must be used within a DropDown');
		}

		onMount(() => {
			registerItem(ref);
		});

		$$renderer.push(`<button${$.attr_class($.clsx(className))}${$.attr('title', title)} type="button"${$.attr('aria-label', ariaLabel)}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></button>`);
	});
}