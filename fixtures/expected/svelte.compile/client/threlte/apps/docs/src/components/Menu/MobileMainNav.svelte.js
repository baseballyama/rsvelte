import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MobileNav from './MobileNav.svelte';

var root = $.from_html(`<a><!></a>`);
var root_1 = $.from_html(`<div class="flex flex-col gap-2 text-lg"><a>Documentation</a> <a>Blog</a>  <div class="mt-4"><!></div></div>`);

export default function MobileMainNav($$anchor, $$props) {
	$.push($$props, true);

	{
		const topbarLeft = ($$anchor) => {
			var a = root();
			var node = $.child(a);

			$.snippet(node, () => $$props.logo ?? $.noop);
			$.reset(a);
			$.template_effect(() => $.set_attribute(a, 'href', import.meta.env.BASE_URL));
			$.append($$anchor, a);
		};

		const content = ($$anchor) => {
			var div = root_1();
			var a_1 = $.child(div);
			var a_2 = $.sibling(a_1, 2);
			var div_1 = $.sibling(a_2, 2);
			var node_1 = $.child(div_1);

			$.snippet(node_1, () => $$props.socials ?? $.noop);
			$.reset(div_1);
			$.reset(div);

			$.template_effect(() => {
				$.set_attribute(a_1, 'href', `${import.meta.env.BASE_URL}docs/learn/getting-started/introduction`);
				$.set_attribute(a_2, 'href', `${import.meta.env.BASE_URL}blog`);
			});

			$.append($$anchor, div);
		};

		MobileNav($$anchor, {
			topbarLeft,
			content,
			$$slots: { topbarLeft: true, content: true }
		});
	}

	$.pop();
}