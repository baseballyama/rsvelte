import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IconAlertTriangle, IconCheck, IconInfoCircle, IconX } from '@tabler/icons-svelte';
import { toastStore } from '$lib/stores/toast.svelte';

var root = $.from_html(`<button type="button" class="flex-shrink-0 px-3 py-1 text-sm font-medium rounded-md bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"> </button>`);
var root_1 = $.from_html(`<div role="alert"><div class="flex items-center gap-3"><div class="flex-shrink-0 flex items-center"><!></div> <div class="flex-1 text-sm leading-5"> </div> <!> <button type="button" class="flex-shrink-0 p-1 rounded opacity-70 hover:opacity-100 transition-opacity" aria-label="Close"><!></button></div></div>`);
var root_2 = $.from_html(`<div class="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-notification flex flex-col gap-2 max-w-md sm:max-w-sm max-sm:left-[calc(1rem+env(safe-area-inset-left))] max-sm:right-[calc(1rem+env(safe-area-inset-right))]"></div>`);

export default function Toast($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(() => ({ toasts: toastStore.toasts })),
		toasts = $.derived(() => $.get($$d).toasts);

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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_2();

			$.each(div, 21, () => $.get(toasts), (toast) => toast.id, ($$anchor, toast) => {
				const Icon = $.derived(() => getIcon($.get(toast).type));
				var div_1 = root_1();
				var div_2 = $.child(div_1);
				var div_3 = $.child(div_2);
				var node_1 = $.child(div_3);

				$.component(node_1, () => $.get(Icon), ($$anchor, Icon_1) => {
					Icon_1($$anchor, { size: 20 });
				});

				$.reset(div_3);

				var div_4 = $.sibling(div_3, 2);
				var text = $.only_child(div_4, true);
				var node_2 = $.sibling(div_4, 2);

				{
					var consequent = ($$anchor) => {
						var button = root();
						var text_1 = $.only_child(button, true);

						$.template_effect(() => $.set_text(text_1, $.get(toast).action.label));

						$.delegated('click', button, () => {
							$.get(toast).action?.onClick();
							toastStore.dismiss($.get(toast).id);
						});

						$.append($$anchor, button);
					};

					$.if(node_2, ($$render) => {
						if ($.get(toast).action) $$render(consequent);
					});
				}

				var button_1 = $.sibling(node_2, 2);
				var node_3 = $.child(button_1);

				IconX(node_3, { size: 16 });
				$.reset(button_1);
				$.reset(div_2);
				$.reset(div_1);

				$.template_effect(
					($0) => {
						$.set_class(div_1, 1, `p-4 rounded-lg border shadow-lg animate-slide-in ${$0 ?? ''}`, 'svelte-1cpok13');
						$.set_text(text, $.get(toast).message);
					},
					[() => getColorClasses($.get(toast).type)]
				);

				$.delegated('click', button_1, () => toastStore.dismiss($.get(toast).id));
				$.append($$anchor, div_1);
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(toasts).length > 0) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);