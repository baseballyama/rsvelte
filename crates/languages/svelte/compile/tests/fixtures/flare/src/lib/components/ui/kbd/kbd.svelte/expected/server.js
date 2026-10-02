import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils';
import { tv } from 'tailwind-variants';

const style = tv({
	base: 'inline-flex place-items-center justify-center gap-1 rounded-md p-0.5 font-sans',
	variants: {
		variant: {
			outline: 'border-border bg-transparent text-muted-foreground border',
			secondary: 'bg-secondary text-muted-foreground',
			primary: 'bg-primary text-primary-foreground'
		},
		size: {
			sm: 'min-w-6 gap-1.5 p-0.5 px-1 text-sm',
			default: 'min-w-6 gap-1.5 p-1 text-xs',
			lg: 'min-w-9 gap-2 p-1 px-3 text-lg'
		}
	}
});

export default function Kbd($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			size = 'default',
			variant = 'outline',
			children
		} = $$props;

		$$renderer.push(`<kbd${$.attr_class($.clsx(cn(style({ size, variant }), className)))}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></kbd>`);
		$.bind_props($$props, { ref });
	});
}