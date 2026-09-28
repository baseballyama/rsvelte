import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a class="group no-underline"><span class="underline-offset-4 group-hover:underline"><!></span> <span aria-hidden="true" class="ml-2 text-muted-foreground opacity-0 group-hover:opacity-100">#</span></a>`);

export default function Heading_anchor($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var a = root();
			var span = $.child(a);
			var node_1 = $.child(span);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.reset(span);
			$.next(2);
			$.reset(a);
			$.template_effect(() => $.set_attribute(a, 'href', `#${$$props.id}`));
			$.append($$anchor, a);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$props.id) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}