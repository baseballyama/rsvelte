import 'svelte/internal/disclose-version';
import { tv } from 'tailwind-variants';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils';

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

var root = $.from_html(`<kbd><!></kbd>`);

export default function Kbd($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		size = $.prop($$props, 'size', 3, 'default'),
		variant = $.prop($$props, 'variant', 3, 'outline');

	var kbd = root();
	var node = $.child(kbd);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(kbd);
	$.bind_this(kbd, ($$value) => ref($$value), () => ref());

	$.template_effect(($0) => $.set_class(kbd, 1, $0), [
		() => $.clsx(cn(style({ size: size(), variant: variant() }), $$props.class))
	]);

	$.append($$anchor, kbd);
	$.pop();
}