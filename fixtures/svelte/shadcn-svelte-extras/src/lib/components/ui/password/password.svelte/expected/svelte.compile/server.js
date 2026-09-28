import * as $ from 'svelte/internal/server';
import { box } from 'svelte-toolbelt';
import { usePassword } from './password.svelte.js';
import { cn } from '$lib/utils.js';

export default function Password($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			hidden = true,
			minScore = 3,
			class: className,
			children
		} = $$props;

		usePassword({
			hidden: box.with(() => hidden, (v) => hidden = v),
			minScore: box.with(() => minScore)
		});

		$$renderer.push(`<div${$.attr_class($.clsx(cn('flex flex-col gap-2', className)))}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref, hidden });
	});
}