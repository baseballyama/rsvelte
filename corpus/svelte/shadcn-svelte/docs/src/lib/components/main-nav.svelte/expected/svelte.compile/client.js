import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import Button from "$lib/registry/ui/button/button.svelte";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'items', 'class']);
var root = $.from_html(`<nav></nav>`);

export default function Main_nav($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var nav = root();

	$.attribute_effect(nav, ($0) => ({ class: $0, ...restProps }), [() => cn("items-center gap-0.5", $$props.class)]);

	$.each(nav, 21, () => $$props.items, (item) => item.href, ($$anchor, item) => {
		{
			let $0 = $.derived(() => cn(page.url.pathname === $.get(item).href && "text-primary"));

			Button($$anchor, {
				get href() {
					return $.get(item).href;
				},
				variant: 'ghost',
				size: 'sm',
				get class() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, $.get(item).title));
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		}
	});

	$.reset(nav);
	$.append($$anchor, nav);
	$.pop();
}