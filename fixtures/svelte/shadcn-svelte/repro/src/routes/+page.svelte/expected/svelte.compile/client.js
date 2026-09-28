import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button";
import { LightSwitch } from "$lib/components/ui/light-switch";

var root = $.from_html(`<header class="sticky top-0 flex w-full items-center justify-end p-4"><!></header> <main class="flex h-screen flex-col place-items-center justify-center gap-2"><h1 class="text-4xl font-bold">shadcn-svelte repro template</h1> <p class="text-muted-foreground">Import and use components here to create a minimal reproduction of your issue.</p> <!></main>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var header = $.first_child(fragment);
	var node = $.child(header);

	LightSwitch(node, { variant: 'outline', size: 'icon' });
	$.reset(header);

	var main = $.sibling(header, 2);
	var node_1 = $.sibling($.child(main), 4);

	Button(node_1, {
		variant: 'outline',
		href: 'https://github.com/huntabyte/shadcn-svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('GitHub');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(main);
	$.append($$anchor, fragment);
}