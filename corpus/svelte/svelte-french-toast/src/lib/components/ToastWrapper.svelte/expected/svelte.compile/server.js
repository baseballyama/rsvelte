import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { prefersReducedMotion } from '../core/utils';
import ToastBar from './ToastBar.svelte';
import ToastMessage from './ToastMessage.svelte';

export default function ToastWrapper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { toast, setHeight, children } = $$props;
		let clientHeight = void 0;

		onMount(() => {
			if (clientHeight === undefined) return;

			setHeight(clientHeight);
		});

		let top = $.derived(() => toast.position?.includes('top') ? 0 : null);
		let bottom = $.derived(() => toast.position?.includes('bottom') ? 0 : null);
		let factor = $.derived(() => toast.position?.includes('top') ? 1 : -1);
		let justifyContent = $.derived(() => toast.position?.includes('center') && 'center' || (toast.position?.includes('right') || toast.position?.includes('end')) && 'flex-end' || null);

		$$renderer.push(`<div${$.attr_class('_sft-wrapper svelte-148ohzq', void 0, {
			'_sft-active': toast.visible,
			'_sft-transition': !prefersReducedMotion()
		})}${$.attr_style('', {
			'--factor': factor(),
			'--offset': toast.offset,
			top,
			bottom,
			'justify-content': justifyContent()
		})}>`);

		if (toast.type === 'custom') {
			$$renderer.push('<!--[0-->');
			ToastMessage($$renderer, { toast });
		} else if (children) {
			$$renderer.push('<!--[1-->');
			children($$renderer, { toast });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
			ToastBar($$renderer, { toast, position: toast.position });
		}

		$$renderer.push(`<!--]--></div>`);
	});
}