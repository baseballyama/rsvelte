import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>We have a static prop: <b id="staticprop"> </b></p> <button type="button" id="fooeventtrigger">Trigger route event from Foo</button>`, 1);
var root_1 = $.from_html(`<p>No static props here!</p>`);

export default function Foo($$anchor, $$props) {
	$.push($$props, true);

	let staticProp = $.prop($$props, 'staticProp', 3, null),
		onRouteEvent = $.prop($$props, 'onRouteEvent', 3, () => {});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var p = $.first_child(fragment_1);
			var b = $.sibling($.child(p));
			var text = $.only_child(b, true);

			$.reset(p);

			var button = $.sibling(p, 2);

			$.template_effect(() => $.set_text(text, staticProp()));
			$.delegated('click', button, () => onRouteEvent()({ action: 'foo', staticProp: staticProp() }));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var p_1 = root_1();

			$.append($$anchor, p_1);
		};

		$.if(node, ($$render) => {
			if (staticProp()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);