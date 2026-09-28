import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import { ScrollArea } from "$lib/registry/ui/scroll-area/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_html(`<a> </a>`);
var root_1 = $.from_html(`<div></div>`);
var root_2 = $.from_html(`<div class="relative overflow-hidden"><!></div>`);

export default function Charts_nav($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	const links = [
		{ name: "Area Charts", href: "/charts/area#charts" },
		{ name: "Bar Charts", href: "/charts/bar#charts" },
		{ name: "Line Charts", href: "/charts/line#charts" },
		{ name: "Pie Charts", href: "/charts/pie#charts" },
		{ name: "Radar Charts", href: "/charts/radar#charts" },
		{ name: "Radial Charts", href: "/charts/radial#charts" },
		{ name: "Tooltips", href: "/charts/tooltip#charts" }
	];

	var div = root_2();
	var node = $.child(div);

	ScrollArea(node, {
		class: 'max-w-[600px] lg:max-w-none',
		orientation: 'both',
		scrollbarXClasses: 'invisible',
		children: ($$anchor, $$slotProps) => {
			var div_1 = root_1();

			$.attribute_effect(div_1, ($0) => ({ class: $0, ...restProps }), [() => cn("flex items-center", $$props.class)]);

			$.each(div_1, 21, () => links, (link) => link.href, ($$anchor, link) => {
				var a = root();
				var text = $.only_child(a, true);

				$.template_effect(
					($0, $1) => {
						$.set_attribute(a, 'href', $.get(link).href);
						$.set_attribute(a, 'data-active', $0);
						$.set_class(a, 1, $1);
						$.set_text(text, $.get(link).name);
					},
					[
						() => $.get(link).href.startsWith(page.url.pathname),
						() => $.clsx(cn("flex h-7 shrink-0 items-center justify-center px-4 text-center text-base font-medium text-muted-foreground transition-colors hover:text-primary data-[active=true]:text-primary"))
					]
				);

				$.append($$anchor, a);
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}