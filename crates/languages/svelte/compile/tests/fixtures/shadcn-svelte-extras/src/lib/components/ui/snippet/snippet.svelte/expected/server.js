import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { tv } from 'tailwind-variants';
import { CopyButton } from '../copy-button';

const style = tv({
	base: 'bg-background relative w-full max-w-full rounded-md border py-2.5 pr-12 pl-3',
	variants: {
		variant: {
			default: 'border-border bg-card',
			secondary: 'border-border bg-accent',
			destructive: 'border-destructive bg-destructive',
			primary: 'border-primary bg-primary text-primary-foreground'
		}
	}
});

export default function Snippet($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { text, variant = 'default', onCopy, class: className } = $$props;

		$$renderer.push(`<div${$.attr_class($.clsx(cn(style({ variant, className }))))}>`);

		if (typeof text == 'string') {
			$$renderer.push(`<!--[0--><pre${$.attr_class($.clsx(cn('overflow-y-auto text-left font-mono text-sm font-light whitespace-nowrap')))}>
			${$.escape(text)}
		</pre>`);
		} else {
			$$renderer.push(`<!--[-1--><!--[-->`);

			const each_array = $.ensure_array_like(text);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let line = each_array[i];

				$$renderer.push(`<pre${$.attr_class($.clsx(cn('overflow-y-auto text-left font-mono text-sm font-light whitespace-nowrap')))}>
			${$.escape(line)}
		</pre>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--> `);

		CopyButton($$renderer, {
			class: 'hover:text-opacity-80 absolute top-1/2 right-2 size-7 -translate-y-1/2 transition-opacity ease-in-out hover:bg-transparent dark:hover:bg-transparent',
			text: typeof text === 'string' ? text : text.join('\n'),
			onCopy
		});

		$$renderer.push(`<!----></div>`);
	});
}