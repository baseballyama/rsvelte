import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ChevronRight, Home } from '@lucide/svelte';

var root = $.from_html(`<li class="flex-shrink-0"><div class="flex items-center"><!> <div class="grid grid-cols-1"><a> </a></div></div></li>`);
var root_1 = $.from_html(`<nav class="flex overflow-x-auto scrollbar-none whitespace-nowrap sm:py-1 svelte-1vm5avy" aria-label="Breadcrumb"><div class="inline-flex items-center space-x-1 text-sm md:space-x-2"><div class="inline-flex flex-shrink-0 items-center"><a href="/" class="inline-flex items-center text-muted-foreground hover:text-foreground"><!> Home</a></div> <ol class="inline-flex items-center space-x-1 md:space-x-2"></ol></div></nav>`);

export default function Breadcrumb($$anchor, $$props) {
	$.push($$props, true);

	// Categories with a blank name or slug render as an empty, dead breadcrumb link, and
	// reach the BreadcrumbList schema as positions with no name.
	const crumbs = $.derived(() => ($$props.categoryHierarchy || []).filter((c) => String(c?.name ?? '').trim() && String(c?.slug ?? '').trim()));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var nav = root_1();
			var div = $.child(nav);
			var div_1 = $.child(div);
			var a = $.child(div_1);
			var node_1 = $.child(a);

			Home(node_1, { class: 'mr-2 h-4 w-4 max-sm:hidden flex-shrink-0' });
			$.next();
			$.reset(a);
			$.reset(div_1);

			var ol = $.sibling(div_1, 2);

			$.each(ol, 21, () => $.get(crumbs), $.index, ($$anchor, $$item, i) => {
				let slug = () => $.get($$item).slug;
				let name = () => $.get($$item).name;
				var li = root();
				var div_2 = $.child(li);
				var node_2 = $.child(div_2);

				ChevronRight(node_2, {
					class: 'h-4 min-h-4 w-4 min-w-4 text-muted-foreground flex-shrink-0'
				});

				var div_3 = $.sibling(node_2, 2);
				var a_1 = $.child(div_3);
				var text = $.only_child(a_1, true);

				$.reset(div_3);
				$.reset(div_2);
				$.reset(li);

				$.template_effect(() => {
					$.set_attribute(a_1, 'href', `/${slug() ?? ''}`);

					$.set_class(a_1, 1, `block text-muted-foreground hover:text-foreground md:ml-2 ${i === $$props.categoryHierarchy.length - 1
						? 'truncate max-w-[calc(100vw-9rem)] sm:max-w-[500px] lg:max-w-[760px] xl:max-w-[980px] 2xl:max-w-[1180px]'
						: ''}`);

					$.set_attribute(a_1, 'title', name());
					$.set_text(text, name());
				});

				$.append($$anchor, li);
			});

			$.reset(ol);
			$.reset(div);
			$.reset(nav);
			$.append($$anchor, nav);
		};

		$.if(node, ($$render) => {
			if ($$props.categoryHierarchy && $$props.categoryHierarchy.length > 0) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}