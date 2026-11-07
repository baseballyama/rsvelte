import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<img class="svelte-d7pv0n"/>`);
var root_1 = $.from_html(`<p class="noor-footer-wordmark svelte-d7pv0n"> </p>`);
var root_2 = $.from_html(`<p class="svelte-d7pv0n"> </p>`);
var root_3 = $.from_html(`<a class="svelte-d7pv0n"> </a>`);
var root_4 = $.from_html(`<div class="noor-footer-column"><h3 class="svelte-d7pv0n"> </h3> <!> <!></div>`);
var root_5 = $.from_html(`<footer class="noor-footer svelte-d7pv0n"><div class="noor-footer-brand svelte-d7pv0n"><!> <!></div> <!></footer>`);

export default function NoorFooter($$anchor, $$props) {
	$.push($$props, true);

	let description = $.prop($$props, 'description', 3, ''),
		brandName = $.prop($$props, 'brandName', 3, '');

	var footer_1 = root_5();
	var div = $.child(footer_1);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var img = root();

			$.template_effect(() => {
				$.set_attribute(img, 'src', $$props.footer.logo);
				$.set_attribute(img, 'alt', $$props.footer.logoAlt || brandName());
			});

			$.append($$anchor, img);
		};

		var consequent_1 = ($$anchor) => {
			var p = root_1();
			var text_1 = $.only_child(p, true);

			$.template_effect(() => $.set_text(text_1, brandName()));
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($$props.footer?.logo) $$render(consequent); else if (brandName()) $$render(consequent_1, 1);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			var p_1 = root_2();
			var text_2 = $.only_child(p_1, true);

			$.template_effect(() => $.set_text(text_2, description()));
			$.append($$anchor, p_1);
		};

		$.if(node_1, ($$render) => {
			if (description()) $$render(consequent_2);
		});
	}

	$.reset(div);

	var node_2 = $.sibling(div, 2);

	$.each(node_2, 17, () => $$props.footer?.columns || [], $.index, ($$anchor, column) => {
		var div_1 = root_4();
		var h3 = $.child(div_1);
		var text_3 = $.only_child(h3, true);
		var node_3 = $.sibling(h3, 2);

		$.each(node_3, 17, () => $.get(column).links || [], $.index, ($$anchor, link) => {
			var a = root_3();
			var text_4 = $.only_child(a, true);

			$.template_effect(() => {
				$.set_attribute(a, 'href', $.get(link).href);
				$.set_text(text_4, $.get(link).label);
			});

			$.append($$anchor, a);
		});

		var node_4 = $.sibling(node_3, 2);

		$.each(node_4, 17, () => $.get(column).text || [], $.index, ($$anchor, text) => {
			var p_2 = root_2();
			var text_5 = $.only_child(p_2, true);

			$.template_effect(() => $.set_text(text_5, $.get(text)));
			$.append($$anchor, p_2);
		});

		$.reset(div_1);
		$.template_effect(() => $.set_text(text_3, $.get(column).title));
		$.append($$anchor, div_1);
	});

	$.reset(footer_1);
	$.append($$anchor, footer_1);
	$.pop();
}