import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<i role="img"><!></i>`);
var root_1 = $.from_html(`<i></i>`);

export default function Icon($$anchor, $$props) {
	let css = $.prop($$props, 'css', 3, ""),
		title = $.prop($$props, 'title', 3, "");

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var i = root();
			var node_1 = $.child(i);

			$.snippet(node_1, () => $$props.children);
			$.reset(i);

			$.template_effect(() => {
				$.set_attribute(i, 'title', title());
				$.set_class(i, 1, `wx-icon ${css() ?? ''}`, 'svelte-1tklajd');
				$.set_attribute(i, 'data-tooltip-text', $$props.tooltip);
			});

			$.delegated('click', i, function (...$$args) {
				$$props.onclick?.apply(this, $$args);
			});

			$.append($$anchor, i);
		};

		var alternate = ($$anchor) => {
			var i_1 = root_1();

			$.template_effect(() => {
				$.set_attribute(i_1, 'title', title());
				$.set_class(i_1, 1, `wx-icon ${css() ?? ''}`, 'svelte-1tklajd');
				$.set_attribute(i_1, 'data-tooltip-text', $$props.tooltip);
			});

			$.delegated('click', i_1, function (...$$args) {
				$$props.onclick?.apply(this, $$args);
			});

			$.append($$anchor, i_1);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}

$.delegate(['click']);