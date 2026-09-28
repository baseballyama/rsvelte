import * as $ from 'svelte/internal/server';
import DialogTitle from './dialog-title.svelte';
import { Loader } from 'lucide-svelte';
import Icon from '@iconify/svelte';
import { cn } from '$lib/utils.js';
import { Button } from '$lib/components/ui/button';
import { mod_key_held } from '$lib/builder/stores/app/misc.js';

export default function Dialog_header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			ref = null,
			class: className,
			children,
			title,
			icon,
			button,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn('grid grid-cols-3 items-center', className)),
			...restProps
		})}><div class="ml-6">`);

		children?.($$renderer);
		$$renderer.push(`<!----></div> `);

		DialogTitle($$renderer, {
			class: 'text-center flex items-center justify-center gap-2',
			children: ($$renderer) => {
				if (icon) {
					$$renderer.push('<!--[0-->');
					Icon($$renderer, { icon, class: 'h-4 w-4' });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <span>${$.escape(title)}</span>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (button?.label) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				variant: 'default',
				onclick: button.onclick,
				disabled: button.disabled,
				class: 'justify-self-end inline-flex justify-center items-center relative',
				children: ($$renderer) => {
					$$renderer.push(`<span${$.attr_class('', void 0, {
						'opacity-0': button.hint && $.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held) || button.loading
					})}>${$.escape(button.label)}</span> `);

					if (button.hint && $.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held) && !button.loading) {
						$$renderer.push(`<!--[0--><span class="absolute inset-0 flex items-center justify-center">${$.escape(button.hint)}</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (button.loading) {
						$$renderer.push(`<!--[0--><div class="animate-spin absolute inset-0 flex items-center justify-center">`);
						Loader($$renderer, {});
						$$renderer.push(`<!----></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { ref });
	});
}