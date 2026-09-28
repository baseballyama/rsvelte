import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h4 class="text-xs font-bold uppercase tracking-widest text-foreground"> </h4>`);
var root_1 = $.from_html(`<a class="text-sm text-muted-foreground transition-colors hover:text-foreground"> </a>`);
var root_2 = $.from_html(`<span class="text-sm text-muted-foreground"> </span>`);
var root_3 = $.from_html(`<li><!></li>`);
var root_4 = $.from_html(`<ul class="flex flex-col gap-1"></ul>`);
var root_5 = $.from_html(`<div class="flex flex-col gap-3"><!> <!></div>`);
var root_6 = $.from_html(`<div class="flex-1"><div class="grid grid-cols-2 gap-8 sm:grid-cols-3"></div></div>`);

export default function Footer_menu($$anchor, $$props) {
	var div = root_6();
	var div_1 = $.child(div);

	$.each(div_1, 21, () => $$props.items, $.index, ($$anchor, item) => {
		var div_2 = root_5();
		var node = $.child(div_2);

		{
			var consequent = ($$anchor) => {
				var h4 = root();
				var text = $.only_child(h4, true);

				$.template_effect(() => $.set_text(text, $.get(item).name));
				$.append($$anchor, h4);
			};

			$.if(node, ($$render) => {
				if ($.get(item)?.name) $$render(consequent);
			});
		}

		var node_1 = $.sibling(node, 2);

		{
			var consequent_2 = ($$anchor) => {
				var ul = root_4();

				$.each(ul, 21, () => $.get(item).items, $.index, ($$anchor, child) => {
					var li = root_3();
					var node_2 = $.child(li);

					{
						var consequent_1 = ($$anchor) => {
							var a = root_1();
							var text_1 = $.only_child(a, true);

							$.template_effect(() => {
								$.set_attribute(a, 'href', $.get(child).link || '#');
								$.set_text(text_1, $.get(child).name);
							});

							$.append($$anchor, a);
						};

						var alternate = ($$anchor) => {
							var span = root_2();
							var text_2 = $.only_child(span, true);

							$.template_effect(() => $.set_text(text_2, $.get(child).name));
							$.append($$anchor, span);
						};

						$.if(node_2, ($$render) => {
							if ($.get(child).link) $$render(consequent_1); else $$render(alternate, -1);
						});
					}

					$.reset(li);
					$.append($$anchor, li);
				});

				$.reset(ul);
				$.append($$anchor, ul);
			};

			$.if(node_1, ($$render) => {
				if ($.get(item)?.items?.length > 0) $$render(consequent_2);
			});
		}

		$.reset(div_2);
		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}