import * as $ from 'svelte/internal/server';
import { IconAlertTriangle, IconCheck, IconInfoCircle, IconX } from '@tabler/icons-svelte';
import { toastStore } from '$lib/stores/toast.svelte';

export default function Toast($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const $$d = $.derived(() => ({ toasts: toastStore.toasts })),
			toasts = $.derived(() => $$d().toasts);

		function getIcon(type) {
			switch (type) {
				case 'success':
					return IconCheck;

				case 'warning':
					return IconAlertTriangle;

				case 'error':
					return IconX;

				default:
					return IconInfoCircle;
			}
		}

		function getColorClasses(type) {
			switch (type) {
				case 'success':
					return 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800';

				case 'warning':
					return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';

				case 'error':
					return 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';

				default:
					return 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800';
			}
		}

		if (toasts().length > 0) {
			$$renderer.push(`<!--[0--><div class="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-notification flex flex-col gap-2 max-w-md sm:max-w-sm max-sm:left-[calc(1rem+env(safe-area-inset-left))] max-sm:right-[calc(1rem+env(safe-area-inset-right))]"><!--[-->`);

			const each_array = $.ensure_array_like(toasts());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let toast = each_array[$$index];
				const Icon = getIcon(toast.type);

				$$renderer.push(`<div${$.attr_class(`p-4 rounded-lg border shadow-lg animate-slide-in ${$.stringify(getColorClasses(toast.type))}`, 'svelte-1cpok13')} role="alert"><div class="flex items-center gap-3"><div class="flex-shrink-0 flex items-center">`);

				if (Icon) {
					$$renderer.push('<!--[-->');
					Icon($$renderer, { size: 20 });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</div> <div class="flex-1 text-sm leading-5">${$.escape(toast.message)}</div> `);

				if (toast.action) {
					$$renderer.push(`<!--[0--><button type="button" class="flex-shrink-0 px-3 py-1 text-sm font-medium rounded-md bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition-colors">${$.escape(toast.action.label)}</button>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <button type="button" class="flex-shrink-0 p-1 rounded opacity-70 hover:opacity-100 transition-opacity" aria-label="Close">`);
				IconX($$renderer, { size: 16 });
				$$renderer.push(`<!----></button></div></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}