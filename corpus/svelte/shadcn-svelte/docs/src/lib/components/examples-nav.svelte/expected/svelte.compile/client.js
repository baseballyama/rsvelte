import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import ScrollArea from "$lib/registry/ui/scroll-area/scroll-area.svelte";
import { cn } from "$lib/utils.js";

const ExampleLink = ($$anchor, $$arg0) => {
	let example = () => ($$arg0?.()).example;
	let isActive = () => ($$arg0?.()).isActive;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var a = root();
			var text = $.only_child(a, true);

			$.template_effect(() => {
				$.set_attribute(a, 'href', example().href);
				$.set_attribute(a, 'data-active', isActive());
				$.set_text(text, example().name);
			});

			$.append($$anchor, a);
		};

		$.if(node, ($$render) => {
			if (!example().hidden) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
};

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_html(`<a class="flex h-7 items-center justify-center px-4 text-center text-base font-medium text-muted-foreground transition-colors hover:text-primary data-[active=true]:text-primary"> </a>`);
var root_1 = $.from_html(`<div class="flex items-center"><!> <!></div>`);
var root_2 = $.from_html(`<div><!></div>`);

export default function Examples_nav($$anchor, $$props) {
	$.push($$props, true);

	const examples = [
		{
			name: "Dashboard",
			href: "/examples/dashboard",
			code: "https://github.com/shadcn/ui/tree/main/apps/v4/app/(app)/examples/dashboard",
			hidden: false
		},

		{
			name: "Tasks",
			href: "/examples/tasks",
			code: "https://github.com/shadcn/ui/tree/main/apps/v4/app/(app)/examples/tasks",
			hidden: false
		},

		{
			name: "Playground",
			href: "/examples/playground",
			code: "https://github.com/shadcn/ui/tree/main/apps/v4/app/(app)/examples/playground",
			hidden: false
		},

		{
			name: "Authentication",
			href: "/examples/authentication",
			code: "https://github.com/shadcn/ui/tree/main/apps/v4/app/(app)/examples/authentication",
			hidden: false
		}
	];

	let restProps = $.rest_props($$props, rest_excludes);
	var div = root_2();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [() => cn("flex items-center", $$props.class)]);

	var node_1 = $.child(div);

	ScrollArea(node_1, {
		class: 'max-w-[96%] md:max-w-[600px] lg:max-w-none',
		orientation: 'both',
		children: ($$anchor, $$slotProps) => {
			var div_1 = root_1();
			var node_2 = $.child(div_1);

			ExampleLink(node_2, () => ({
				example: { name: "Examples", href: "/", code: "", hidden: false },
				isActive: page.url.pathname === "/"
			}));

			var node_3 = $.sibling(node_2, 2);

			$.each(node_3, 17, () => examples, (example) => example.href, ($$anchor, example) => {
				{
					let $0 = $.derived(() => ({
						example: $.get(example),
						isActive: page.url.pathname?.startsWith($.get(example).href) ?? false
					}));

					ExampleLink($$anchor, () => $.get($0));
				}
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