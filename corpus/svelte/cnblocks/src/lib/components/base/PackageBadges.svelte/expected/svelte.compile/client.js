import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from "$lib/components/ui/badge";
import { cn } from "$lib/utils";

var root = $.from_html(`<div data-toc-ignore="true"></div>`);

export default function PackageBadges($$anchor, $$props) {
	$.push($$props, true);

	let packages = $.prop($$props, 'packages', 19, () => []);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.each(div, 20, packages, (pkg) => pkg, ($$anchor, pkg) => {
				Badge($$anchor, {
					variant: 'secondary',
					class: 'rounded-full border-border/60 bg-muted/60 px-2 py-0.5 font-mono text-[11px] leading-none text-muted-foreground',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, pkg));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.template_effect(($0) => $.set_class(div, 1, $0), [() => $.clsx(cn("mt-2 flex flex-wrap gap-2", $$props.class))]);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (packages().length > 0) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}