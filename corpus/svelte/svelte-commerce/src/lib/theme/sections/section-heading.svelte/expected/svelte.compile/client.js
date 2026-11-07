import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { text } from './utils.js';

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`&nbsp;<span> </span>`, 1);
var root_2 = $.from_html(`<h2> <!></h2>`);
var root_3 = $.from_html(`<p> </p>`);
var root_4 = $.from_html(`<a> </a>`);
var root_5 = $.from_html(`<div><!> <!> <!> <!></div>`);

export default function Section_heading($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * The heading block every section shares: eyebrow, title (optionally split so a theme can
	 * accent the second half), supporting copy and a "view all" link. Which of those appear is
	 * decided entirely by the theme's section options.
	 */
	let options = $.prop($$props, 'options', 19, () => ({}));

	const label = $.derived(() => text($$props.ctx, options().label));
	const title = $.derived(() => text($$props.ctx, options().title));
	const titleSuffix = $.derived(() => text($$props.ctx, options().titleSuffix));
	const body = $.derived(() => text($$props.ctx, options().text));
	const cta = $.derived(() => text($$props.ctx, options().cta));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_5 = ($$anchor) => {
			var div = root_5();
			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					var span = root();
					var text_1 = $.only_child(span, true);

					$.template_effect(() => {
						$.set_class(span, 1, `ts-heading-label ${options().labelClass ?? '' ?? ''}`);
						$.set_text(text_1, $.get(label));
					});

					$.append($$anchor, span);
				};

				$.if(node_1, ($$render) => {
					if ($.get(label)) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent_2 = ($$anchor) => {
					var h2 = root_2();
					var text_2 = $.child(h2, true);
					var node_3 = $.sibling(text_2);

					{
						var consequent_1 = ($$anchor) => {
							var fragment_1 = root_1();
							var span_1 = $.sibling($.first_child(fragment_1));
							var text_3 = $.only_child(span_1, true);

							$.template_effect(() => $.set_text(text_3, $.get(titleSuffix)));
							$.append($$anchor, fragment_1);
						};

						$.if(node_3, ($$render) => {
							if ($.get(titleSuffix)) $$render(consequent_1);
						});
					}

					$.reset(h2);
					$.template_effect(() => $.set_text(text_2, $.get(title)));
					$.append($$anchor, h2);
				};

				$.if(node_2, ($$render) => {
					if ($.get(title)) $$render(consequent_2);
				});
			}

			var node_4 = $.sibling(node_2, 2);

			{
				var consequent_3 = ($$anchor) => {
					var p = root_3();
					var text_4 = $.only_child(p, true);

					$.template_effect(() => $.set_text(text_4, $.get(body)));
					$.append($$anchor, p);
				};

				$.if(node_4, ($$render) => {
					if ($.get(body)) $$render(consequent_3);
				});
			}

			var node_5 = $.sibling(node_4, 2);

			{
				var consequent_4 = ($$anchor) => {
					var a = root_4();
					var text_5 = $.only_child(a, true);

					$.template_effect(() => {
						$.set_attribute(a, 'href', options().ctaHref ?? '/products');
						$.set_text(text_5, $.get(cta));
					});

					$.append($$anchor, a);
				};

				$.if(node_5, ($$render) => {
					if ($.get(cta)) $$render(consequent_4);
				});
			}

			$.reset(div);
			$.template_effect(() => $.set_class(div, 1, `ts-heading ${options().class ?? '' ?? ''}`));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(label) || $.get(title) || $.get(body) || $.get(cta)) $$render(consequent_5);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}