import * as $ from 'svelte/internal/server';
import useToaster from '../core/use-toaster';
import ToastWrapper from './ToastWrapper.svelte';

export default function Toaster($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			reverseOrder = false,
			position = 'top-center',
			toastOptions = undefined,
			gutter = 8,
			containerStyle = undefined,
			containerClassName = undefined
		} = $$props;

		const { toasts, handlers } = useToaster(toastOptions);

		let _toasts = $.derived(() => $.store_get($$store_subs ??= {}, '$toasts', toasts).map((toast) => ({
			...toast,
			position: toast.position || position,
			offset: handlers.calculateOffset(toast, $.store_get($$store_subs ??= {}, '$toasts', toasts), { reverseOrder, gutter, defaultPosition: position })
		})));

		$$renderer.push(`<div${$.attr_class(`_sft-toaster ${$.stringify(containerClassName || '')}`, 'svelte-1kymlcg')}${$.attr_style(containerStyle)} role="alert"><!--[-->`);

		const each_array = $.ensure_array_like(_toasts());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let toast = each_array[$$index];

			ToastWrapper($$renderer, {
				toast,
				setHeight: (height) => handlers.updateHeight(toast.id, height)
			});
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}