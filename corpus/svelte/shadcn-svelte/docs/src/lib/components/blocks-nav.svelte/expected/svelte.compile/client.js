import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import { registryCategories } from "$lib/registry/registry-categories.js";
import { ScrollArea } from "$lib/registry/ui/scroll-area/index.js";

const BlocksNavLink = ($$anchor, $$arg0) => {
	let category = () => ($$arg0?.()).category;
	let isActive = () => ($$arg0?.()).isActive;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var a = root();
			var text = $.only_child(a, true);

			$.template_effect(() => {
				$.set_attribute(a, 'href', `/blocks/${category().slug ?? ''}`);
				$.set_attribute(a, 'data-active', isActive());
				$.set_text(text, category().name);
			});

			$.append($$anchor, a);
		};

		$.if(node, ($$render) => {
			if (!category().hidden) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
};

var root = $.from_html(`<a class="flex h-7 items-center justify-center px-4 text-center text-base font-medium text-muted-foreground transition-colors hover:text-primary data-[active=true]:text-primary"> </a>`);
var root_1 = $.from_html(`<div class="flex items-center"><!> <!></div>`);
var root_2 = $.from_html(`<div class="relative overflow-hidden"><!></div>`);

export default function Blocks_nav($$anchor, $$props) {
	$.push($$props, true);

	var div = root_2();
	var node_1 = $.child(div);

	ScrollArea(node_1, {
		class: 'max-w-none',
		orientation: 'both',
		scrollbarXClasses: 'invisible',
		children: ($$anchor, $$slotProps) => {
			var div_1 = root_1();
			var node_2 = $.child(div_1);

			BlocksNavLink(node_2, () => ({
				category: { name: "Featured", slug: "", hidden: false },
				isActive: page.url.pathname === "/blocks"
			}));

			var node_3 = $.sibling(node_2, 2);

			$.each(node_3, 17, () => registryCategories, (category) => category.slug, ($$anchor, category) => {
				BlocksNavLink($$anchor, () => ({
					category: $.get(category),
					isActive: page.url.pathname === `/blocks/${$.get(category).slug}`
				}));
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