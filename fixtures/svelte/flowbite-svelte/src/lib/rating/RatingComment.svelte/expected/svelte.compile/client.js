import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "../buttons/Button.svelte";
import Rating from "./Rating.svelte";

var root = $.from_html(`<p class="ms-2 pt-1 text-sm font-medium text-gray-500 dark:text-gray-400"> </p>`);
var root_1 = $.from_html(`<h3 class="ms-2 text-sm font-semibold text-gray-900 dark:text-white"> </h3>`);
var root_2 = $.from_html(`<footer class="mb-5 text-sm text-gray-500 dark:text-gray-400"><p> </p></footer>`);
var root_3 = $.from_html(`<a class="text-primary-600 dark:text-primary-500 ps-4 text-sm font-medium hover:underline">Report abuse</a>`);
var root_4 = $.from_html(`<div class="mt-3 flex items-center space-x-3 divide-x divide-gray-200 rtl:space-x-reverse rtl:divide-x-reverse dark:divide-gray-600"><!> <!></div>`);
var root_5 = $.from_html(`<article><div class="mb-4 flex items-center space-x-4 rtl:space-x-reverse"><img class="h-10 w-10 rounded-full"/> <div class="space-y-1 font-medium dark:text-white"><p> <time datetime="2014-08-16 19:00" class="block text-sm text-gray-500 dark:text-gray-400"> </time></p></div></div> <div class="mb-1 flex items-center"><!> <!></div> <!> <!> <aside><p class="mt-1 text-xs text-gray-500 dark:text-gray-400"><!></p> <!></aside></article>`);

export default function RatingComment($$anchor, $$props) {
	$.push($$props, true);

	var article = root_5();
	var div = $.child(article);
	var img = $.child(div);
	var div_1 = $.sibling(img, 2);
	var p = $.child(div_1);
	var text_1 = $.child(p);
	var time = $.sibling(text_1);
	var text_2 = $.only_child(time, true);

	$.reset(p);
	$.reset(div_1);
	$.reset(div);

	var div_2 = $.sibling(div, 2);
	var node = $.child(div_2);

	{
		const text = ($$anchor) => {
			var p_1 = root();
			var text_3 = $.only_child(p_1);

			$.template_effect(() => $.set_text(text_3, `${$$props.comment.rating ?? ''} out of ${$$props.comment.total ?? ''}`));
			$.append($$anchor, p_1);
		};

		Rating(node, {
			get total() {
				return $$props.comment.total;
			},

			get rating() {
				return $$props.comment.rating;
			},
			text,
			$$slots: { text: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var h3 = root_1();
			var text_4 = $.only_child(h3, true);

			$.template_effect(() => $.set_text(text_4, $$props.comment.heading));
			$.append($$anchor, h3);
		};

		$.if(node_1, ($$render) => {
			if ($$props.comment.heading) $$render(consequent);
		});
	}

	$.reset(div_2);

	var node_2 = $.sibling(div_2, 2);

	{
		var consequent_1 = ($$anchor) => {
			var footer = root_2();
			var p_2 = $.child(footer);
			var text_5 = $.only_child(p_2);

			$.reset(footer);
			$.template_effect(() => $.set_text(text_5, `Reviewed in ${$$props.comment.address ?? ''} on ${$$props.comment.datetime ?? ''}`));
			$.append($$anchor, footer);
		};

		$.if(node_2, ($$render) => {
			if ($$props.comment.address || $$props.comment.datetime) $$render(consequent_1);
		});
	}

	var node_3 = $.sibling(node_2, 2);

	$.snippet(node_3, () => $$props.children);

	var aside = $.sibling(node_3, 2);
	var p_3 = $.child(aside);
	var node_4 = $.child(p_3);

	{
		var consequent_2 = ($$anchor) => {
			var fragment = $.comment();
			var node_5 = $.first_child(fragment);

			$.snippet(node_5, () => $$props.evaluation);
			$.append($$anchor, fragment);
		};

		$.if(node_4, ($$render) => {
			if ($$props.evaluation) $$render(consequent_2);
		});
	}

	$.reset(p_3);

	var node_6 = $.sibling(p_3, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_3 = root_4();
			var node_7 = $.child(div_3);

			{
				var consequent_3 = ($$anchor) => {
					Button($$anchor, {
						size: 'xs',
						href: '/',
						color: 'dark',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Helpful');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_7, ($$render) => {
					if ($$props.helpfullink) $$render(consequent_3);
				});
			}

			var node_8 = $.sibling(node_7, 2);

			{
				var consequent_4 = ($$anchor) => {
					var a = root_3();

					$.template_effect(() => $.set_attribute(a, 'href', $$props.abuselink));
					$.append($$anchor, a);
				};

				$.if(node_8, ($$render) => {
					if ($$props.abuselink) $$render(consequent_4);
				});
			}

			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		$.if(node_6, ($$render) => {
			if ($$props.helpfullink || $$props.abuselink) $$render(consequent_5);
		});
	}

	$.reset(aside);
	$.reset(article);

	$.template_effect(() => {
		$.set_attribute(img, 'src', $$props.comment.user.img.src);
		$.set_attribute(img, 'alt', $$props.comment.user.img.alt);
		$.set_text(text_1, `${$$props.comment.user.name ?? ''} `);
		$.set_text(text_2, $$props.comment.user.joined);
	});

	$.append($$anchor, article);
	$.pop();
}