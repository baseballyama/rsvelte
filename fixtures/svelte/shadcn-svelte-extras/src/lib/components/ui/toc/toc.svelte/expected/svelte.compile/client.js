import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import Self from './toc.svelte';

var root = $.from_html(`<a class="hover:text-foreground block"> </a>`);
var root_1 = $.from_html(`<li><!></li> <!>`, 1);
var root_2 = $.from_html(`<ul></ul>`);

export default function Toc($$anchor, $$props) {
	$.push($$props, true);

	let isChild = $.prop($$props, 'isChild', 3, false);
	var ul = root_2();

	$.each(ul, 21, () => $$props.toc, $.index, ($$anchor, heading) => {
		var fragment = root_1();
		var li = $.first_child(fragment);
		var node = $.child(li);

		{
			var consequent = ($$anchor) => {
				var a = root();
				var text = $.only_child(a, true);

				$.template_effect(() => {
					$.set_attribute(a, 'href', `#${$.get(heading).id ?? ''}`);
					$.set_text(text, $.get(heading).label);
				});

				$.append($$anchor, a);
			};

			var alternate = ($$anchor) => {
				var text_1 = $.text();

				$.template_effect(() => $.set_text(text_1, $.get(heading).label));
				$.append($$anchor, text_1);
			};

			$.if(node, ($$render) => {
				if ($.get(heading).id) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.reset(li);

		var node_1 = $.sibling(li, 2);

		{
			var consequent_1 = ($$anchor) => {
				Self($$anchor, {
					get class() {
						return $$props.class;
					},

					get toc() {
						return $.get(heading).children;
					},
					isChild: true
				});
			};

			$.if(node_1, ($$render) => {
				if ($.get(heading).children.length > 0) $$render(consequent_1);
			});
		}

		$.template_effect(($0) => $.set_class(li, 1, $0), [
			() => $.clsx(cn('text-muted-foreground mt-0 pt-2 transition-all', { 'text-foreground': $.get(heading).active }))
		]);

		$.append($$anchor, fragment);
	});

	$.reset(ul);

	$.template_effect(($0) => $.set_class(ul, 1, $0), [
		() => $.clsx(cn('m-0 list-none text-sm font-medium', { 'pl-4': isChild() }))
	]);

	$.append($$anchor, ul);
	$.pop();
}