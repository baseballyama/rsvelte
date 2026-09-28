import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";

var root = $.from_html(`<div aria-hidden="true" class="h-18.25 w-full"></div>`);
var root_1 = $.from_html(`<div><!> <div class="modal-body overflow-y-auto overscroll-contain scroll-smooth p-6 svelte-1r576r1"><!></div> <div aria-hidden="true" class="w-full lg:h-18.25"></div></div>`);

export default function Body($$anchor, $$props) {
	$.push($$props, true);

	let klass = $.prop($$props, 'class', 3, "");
	const rootState = getContext("modal");

	let bodyClass = $.derived(() => {
		if (rootState.sticky) {
			return "";
		} else {
			return "";
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_1();
			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					var div_1 = root();

					$.append($$anchor, div_1);
				};

				$.if(node_1, ($$render) => {
					if (rootState.sticky) $$render(consequent);
				});
			}

			var div_2 = $.sibling(node_1, 2);
			var node_2 = $.child(div_2);

			$.snippet(node_2, () => $$props.children);
			$.reset(div_2);
			$.next(2);
			$.reset(div);
			$.template_effect(() => $.set_class(div, 1, `relative h-full ${$.get(bodyClass) ?? ''} ${klass() ?? ''}`, 'svelte-1r576r1'));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}