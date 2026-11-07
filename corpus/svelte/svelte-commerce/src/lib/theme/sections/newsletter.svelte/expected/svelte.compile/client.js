import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { text } from './utils.js';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`&nbsp;<span> </span>`, 1);
var root_2 = $.from_html(`<h2> <!></h2>`);
var root_3 = $.from_html(`<p class="ts-newsletter-text"> </p>`);
var root_4 = $.from_html(`<small class="ts-newsletter-privacy"> </small>`);
var root_5 = $.from_html(`<section><div class="ts-newsletter-copy"><!> <!> <!></div> <form><input type="email" aria-label="Email address"/> <button type="submit"> </button></form> <!></section>`);

export default function Newsletter($$anchor, $$props) {
	$.push($$props, true);

	/** Email capture band. Submission is wired by the store's newsletter plugin, not the theme. */
	let options = $.prop($$props, 'options', 19, () => ({}));

	const label = $.derived(() => text($$props.ctx, options().label));
	const title = $.derived(() => text($$props.ctx, options().title));
	const titleSuffix = $.derived(() => text($$props.ctx, options().titleSuffix));
	const body = $.derived(() => text($$props.ctx, options().text));
	const placeholder = $.derived(() => text($$props.ctx, options().placeholder));
	const cta = $.derived(() => text($$props.ctx, options().cta));
	const privacy = $.derived(() => text($$props.ctx, options().privacy));
	let email = $.state('');
	var section = root_5();
	var div = $.child(section);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text_1 = $.only_child(p, true);

			$.template_effect(() => $.set_text(text_1, $.get(label)));
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($.get(label)) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			var h2 = root_2();
			var text_2 = $.child(h2, true);
			var node_2 = $.sibling(text_2);

			{
				var consequent_1 = ($$anchor) => {
					var fragment = root_1();
					var span = $.sibling($.first_child(fragment));
					var text_3 = $.only_child(span, true);

					$.template_effect(() => $.set_text(text_3, $.get(titleSuffix)));
					$.append($$anchor, fragment);
				};

				$.if(node_2, ($$render) => {
					if ($.get(titleSuffix)) $$render(consequent_1);
				});
			}

			$.reset(h2);
			$.template_effect(() => $.set_text(text_2, $.get(title)));
			$.append($$anchor, h2);
		};

		$.if(node_1, ($$render) => {
			if ($.get(title)) $$render(consequent_2);
		});
	}

	var node_3 = $.sibling(node_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			var p_1 = root_3();
			var text_4 = $.only_child(p_1, true);

			$.template_effect(() => $.set_text(text_4, $.get(body)));
			$.append($$anchor, p_1);
		};

		$.if(node_3, ($$render) => {
			if ($.get(body)) $$render(consequent_3);
		});
	}

	$.reset(div);

	var form = $.sibling(div, 2);
	var input = $.child(form);

	$.remove_input_defaults(input);

	var button = $.sibling(input, 2);
	var text_5 = $.only_child(button, true);

	$.reset(form);

	var node_4 = $.sibling(form, 2);

	{
		var consequent_4 = ($$anchor) => {
			var small = root_4();
			var text_6 = $.only_child(small, true);

			$.template_effect(() => $.set_text(text_6, $.get(privacy)));
			$.append($$anchor, small);
		};

		$.if(node_4, ($$render) => {
			if ($.get(privacy)) $$render(consequent_4);
		});
	}

	$.reset(section);

	$.template_effect(() => {
		$.set_class(section, 1, `ts-newsletter ${options().class ?? '' ?? ''}`);
		$.set_attribute(input, 'placeholder', $.get(placeholder));
		$.set_text(text_5, $.get(cta));
	});

	$.event('submit', form, (e) => e.preventDefault());
	$.bind_value(input, () => $.get(email), ($$value) => $.set(email, $$value));
	$.append($$anchor, section);
	$.pop();
}