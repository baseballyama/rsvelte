import * as $ from 'svelte/internal/server';
import { prefersReducedMotion } from '../core/utils';
import ToastIcon from './ToastIcon.svelte';
import ToastMessage from './ToastMessage.svelte';

export default function ToastBar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			toast,
			position = undefined,
			style = '',
			Component = undefined,
			children
		} = $$props;

		let factor = $.derived(() => {
			const top = (toast.position || position || 'top-center').includes('top');

			return top ? 1 : -1;
		});

		let animation = $.derived(() => {
			const [enter, exit] = prefersReducedMotion()
				? ['_sft-fadeIn', '_sft-fadeOut']
				: ['_sft-enter', '_sft-exit'];

			return toast.visible ? enter : exit;
		});

		$$renderer.push(`<div${$.attr_class(`_sft-base ${$.stringify(toast.height ? animation() : '_sft-transparent')} ${$.stringify(toast.className || '')}`, 'svelte-l6lvp4')}${$.attr_style(`${$.stringify(style)}; ${$.stringify(toast.style)}`, { '--factor': factor() })}>`);

		if (Component) {
			$$renderer.push('<!--[0-->');

			{
				function icon($$renderer) {
					ToastIcon($$renderer, { toast });
				}

				function message($$renderer) {
					ToastMessage($$renderer, { toast });
				}

				if (Component) {
					$$renderer.push('<!--[-->');
					Component($$renderer, { icon, message, $$slots: { icon: true, message: true } });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}
		} else if (children) {
			$$renderer.push('<!--[1-->');
			children($$renderer, { ToastIcon, ToastMessage, toast });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
			ToastIcon($$renderer, { toast });
			$$renderer.push(`<!----> `);
			ToastMessage($$renderer, { toast });
			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}