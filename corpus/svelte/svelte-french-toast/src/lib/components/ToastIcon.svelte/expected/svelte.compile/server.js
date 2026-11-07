import * as $ from 'svelte/internal/server';
import CheckmarkIcon from './CheckmarkIcon.svelte';
import ErrorIcon from './ErrorIcon.svelte';
import LoaderIcon from './LoaderIcon.svelte';

export default function ToastIcon($$renderer, $$props) {
	let { toast } = $$props;

	let type = $.derived(() => toast.type),
		icon = $.derived(() => toast.icon),
		iconTheme = $.derived(() => toast.iconTheme);

	if (typeof icon() === 'string') {
		$$renderer.push(`<!--[0--><div class="_sft-animated svelte-cjoyi">${$.escape(icon())}</div>`);
	} else if (typeof icon() !== 'undefined') {
		$$renderer.push('<!--[1-->');

		const IconComponent = icon();

		if (IconComponent) {
			$$renderer.push('<!--[-->');
			IconComponent($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	} else if (type() !== 'blank') {
		$$renderer.push(`<!--[2--><div class="_sft-indicator svelte-cjoyi">`);
		LoaderIcon($$renderer, $.spread_props([iconTheme()]));
		$$renderer.push(`<!----> `);

		if (type() !== 'loading') {
			$$renderer.push(`<!--[0--><div class="_sft-status svelte-cjoyi">`);

			if (type() === 'error') {
				$$renderer.push('<!--[0-->');
				ErrorIcon($$renderer, $.spread_props([iconTheme()]));
			} else {
				$$renderer.push('<!--[-1-->');
				CheckmarkIcon($$renderer, $.spread_props([iconTheme()]));
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}