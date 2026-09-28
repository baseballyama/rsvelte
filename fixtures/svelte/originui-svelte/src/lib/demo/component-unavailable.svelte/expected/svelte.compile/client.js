import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import { cn } from '$lib/utils.js';
import IconGithub from '~icons/ri/github-fill';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_html(`<!> Create this component`, 1);
var root_1 = $.from_html(`<div><div class="space-y-2"><p class="text-muted-foreground text-sm">Component not available</p> <p class="text-muted-foreground text-xs">Want to contribute and make it happen?</p></div> <!></div>`);

export default function Component_unavailable($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var div = root_1();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [
		() => cn('flex h-full flex-col items-center justify-center gap-4 text-center', $$props.class)
	]);

	var node = $.sibling($.child(div), 2);

	Button(node, {
		variant: 'outline',
		href: 'https://github.com/max-got/originui-svelte',
		size: 'sm',
		class: 'gap-x-2',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			IconGithub(node_1, { width: '16', height: '16', 'aria-hidden': 'true' });
			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}