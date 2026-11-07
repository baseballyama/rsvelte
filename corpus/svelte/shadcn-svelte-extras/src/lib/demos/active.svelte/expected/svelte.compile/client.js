import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { active } from '$lib/actions/active.svelte';

var root = $.from_html(`<a class="text-muted-foreground data-[active=true]:border-l-primary data-[active=true]:bg-secondary data-[active=true]:text-primary data-[active=false]:hover:border-l-secondary data-[active=false]:hover:bg-secondary/50
				rounded-r-md border-l-2 border-transparent
				px-4 py-1
				transition-all"> </a>`);

var root_1 = $.from_html(`<div class="flex w-full max-w-[200px] flex-col gap-1"><span class="text-muted-foreground text-xs font-medium">Components</span> <div class="flex flex-col"></div></div>`);

export default function Active($$anchor) {
	const links = [
		{ title: 'Button', href: '#/', isHash: true },
		{ title: 'Code', href: '#code', isHash: true },
		{ title: 'Field Set', href: '#field-set', isHash: true }
	];

	var div = root_1();
	var div_1 = $.sibling($.child(div), 2);

	$.each(div_1, 21, () => links, ({ title, href, isHash }) => title, ($$anchor, $$item) => {
		let title = () => $.get($$item).title;
		let href = () => $.get($$item).href;
		let isHash = () => $.get($$item).isHash;
		var a = root();
		var text = $.only_child(a, true);

		$.action(a, ($$node, $$action_arg) => active?.($$node, $$action_arg), () => ({ isHash: isHash() }));

		$.template_effect(() => {
			$.set_attribute(a, 'href', href());
			$.set_text(text, title());
		});

		$.append($$anchor, a);
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}