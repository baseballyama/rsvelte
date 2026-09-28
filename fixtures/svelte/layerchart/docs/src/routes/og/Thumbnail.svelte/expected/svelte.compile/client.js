import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span style="display: flex; padding: 4px 16px; border-radius: 9999px; font-size: 18px; color: white; background: rgba(255,255,255,0.15);"> </span>`);
var root_1 = $.from_html(`<p style="display: flex; max-width: 900px; font-size: 28px; color: white; opacity: 0.8; line-height: 1.4;"> </p>`);
var root_2 = $.from_html(`<div style="display: flex; flex-direction: column; width: 100%; height: 100%; padding: 64px; background: linear-gradient(135deg, #1e1b4b, #312e81, #4338ca); font-family: Inter;"><div style="display: flex; flex-direction: column; flex: 1;"><div style="display: flex; align-items: center; margin-bottom: 40px; gap: 16px;"><span style="display: flex; font-size: 30px; font-weight: 700; color: white;">LayerChart</span> <!></div> <p style="display: flex; margin-bottom: 24px; font-size: 72px; font-weight: 700; color: white;"> </p> <!> <div style="display: flex; flex: 1;"></div> <div style="display: flex; justify-content: space-between; font-size: 22px; color: rgba(255,255,255,0.6);"><span style="display: flex;">Composable Svelte visualization library</span> <span style="display: flex;">layerchart.com</span></div></div></div>`);

export default function Thumbnail($$anchor, $$props) {
	var div = root_2();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.sibling($.child(div_2), 2);

	{
		var consequent = ($$anchor) => {
			var span = root();
			var text = $.only_child(span, true);

			$.template_effect(() => $.set_text(text, $$props.component));
			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if ($$props.component) $$render(consequent);
		});
	}

	$.reset(div_2);

	var p = $.sibling(div_2, 2);
	var text_1 = $.only_child(p, true);
	var node_1 = $.sibling(p, 2);

	{
		var consequent_1 = ($$anchor) => {
			var p_1 = root_1();
			var text_2 = $.only_child(p_1, true);

			$.template_effect(() => $.set_text(text_2, $$props.description));
			$.append($$anchor, p_1);
		};

		$.if(node_1, ($$render) => {
			if ($$props.description) $$render(consequent_1);
		});
	}

	$.next(4);
	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_text(text_1, $$props.title));
	$.append($$anchor, div);
}