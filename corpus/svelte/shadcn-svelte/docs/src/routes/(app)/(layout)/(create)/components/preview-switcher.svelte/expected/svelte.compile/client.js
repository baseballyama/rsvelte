import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from "$app/navigation";
import { page } from "$app/state";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<div class="dark absolute right-3 bottom-3 z-20 flex items-center gap-1 rounded-xl bg-card/90 p-1 shadow-xl backdrop-blur-xl"></div>`);

export default function Preview_switcher($$anchor, $$props) {
	$.push($$props, true);

	const PREVIEW_ITEMS = [
		{ label: "01", value: "preview-02" },
		{ label: "02", value: "preview" }
	];

	const visible = $.derived(() => $$props.item === "preview" || $$props.item.startsWith("preview-0"));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.each(div, 21, () => PREVIEW_ITEMS, (previewItem) => previewItem.value, ($$anchor, previewItem) => {
				{
					let $0 = $.derived(() => $$props.item === $.get(previewItem).value);

					Button($$anchor, {
						variant: 'ghost',
						size: 'sm',
						get 'data-active'() {
							return $.get($0);
						},
						class: 'h-7 min-w-8 cursor-pointer rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground',
						onclick: () => goto(`/create/${$.get(previewItem).value}${page.url.search}`),
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, $.get(previewItem).label));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(visible)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}