import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { components } from "$content/index.js";
import { PAGES_NEW } from "$lib/navigation.js";

var root = $.from_html(`<span class="flex size-2 rounded-full bg-svelte-orange" title="New"></span>`);
var root_1 = $.from_html(`<a class="flex items-center gap-2 text-lg font-medium underline-offset-4 hover:underline md:text-base"> <!></a>`);
var root_2 = $.from_html(`<div class="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-x-8 lg:gap-x-16 lg:gap-y-6 xl:gap-x-20"></div>`);

export default function Components_list($$anchor, $$props) {
	$.push($$props, true);

	const list = components.filter((c) => {
		if (c.title === "Components") return false;

		return true;
	});

	var div = root_2();

	$.each(div, 21, () => list, (component) => component.title, ($$anchor, component) => {
		var a = root_1();
		var text = $.child(a);
		var node = $.sibling(text);

		{
			var consequent = ($$anchor) => {
				var span = root();

				$.append($$anchor, span);
			};

			var d = $.derived(() => PAGES_NEW.includes("/docs" + $.get(component).slugFull));

			$.if(node, ($$render) => {
				if ($.get(d)) $$render(consequent);
			});
		}

		$.reset(a);

		$.template_effect(() => {
			$.set_attribute(a, 'href', `/docs${$.get(component).slugFull ?? ''}`);
			$.set_text(text, `${$.get(component).title ?? ''} `);
		});

		$.append($$anchor, a);
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}