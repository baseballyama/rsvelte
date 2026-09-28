import * as $ from 'svelte/internal/server';
import { mdiInformation } from '@mdi/js';
import Icon from '../lib/components/Icon.svelte';
import { cls } from '@layerstack/tailwind';

export default function Blockquote($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div${$.attr_class($.clsx(cls('bg-primary/10 border border-l-[6px] border-primary/30 border-l-primary text-primary px-4 py-2 my-4 rounded flex items-center gap-2 text-sm', '[&>a]:font-medium [&>a]:underline [&>a]:decoration-dashed [&>a]:decoration-primary/50 [&>a]:underline-offset-2')))}>`);
		Icon($$renderer, { data: mdiInformation, class: 'text-primary' });
		$$renderer.push(`<!----> <!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]--></div>`);
	});
}