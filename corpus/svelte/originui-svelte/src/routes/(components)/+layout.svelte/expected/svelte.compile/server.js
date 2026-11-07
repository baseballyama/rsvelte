import * as $ from 'svelte/internal/server';
import Cta from '$lib/demo/cta.svelte';
import * as ComponentDialog from '$lib/demo/component-preview';
import { mode } from 'mode-watcher';
import { Toaster } from 'svelte-sonner';

export default function _layout($$renderer, $$props) {
	var $$store_subs;
	let { children } = $$props;

	Toaster($$renderer, {
		position: 'top-right',
		theme: $.store_get($$store_subs ??= {}, '$mode', mode)
	});

	$$renderer.push(`<!----> `);

	if (ComponentDialog.DialogContextProvider) {
		$$renderer.push('<!--[-->');

		ComponentDialog.DialogContextProvider($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<main class="grow">`);
				children($$renderer);
				$$renderer.push(`<!----> `);
				Cta($$renderer, {});
				$$renderer.push(`<!----></main> `);

				if (ComponentDialog.Dialog) {
					$$renderer.push('<!--[-->');
					ComponentDialog.Dialog($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}