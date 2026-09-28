import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { review as reviewVariants } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<li><!></li>`);
var root_2 = $.from_html(`<ul><!> <!> <!></ul>`);
var root_3 = $.from_html(`<footer><p class="mb-2 text-sm text-gray-500 dark:text-gray-400"> </p></footer>`);
var root_4 = $.from_html(`<article><div><div><img/> <div><p> </p> <!></div></div> <!></div> <div class="col-span-2 mt-6 md:mt-0"><div class="mb-5 flex items-start"><div class="pe-4"><!> <h4 class="text-xl font-bold text-gray-900 dark:text-white"> </h4></div> <p class="bg-primary-700 inline-flex items-center rounded-sm p-1.5 text-sm font-semibold text-white"> </p></div> <!></div></article>`);

export default function Review($$anchor, $$props) {
	$.push($$props, true);

	warnThemeDeprecation(
		"Review",
		untrack(() => ({
			articleClass: $$props.articleClass,
			divClass: $$props.divClass,
			div2Class: $$props.div2Class,
			div3Class: $$props.div3Class,
			imgClass: $$props.imgClass,
			ulClass: $$props.ulClass,
			liClass: $$props.liClass
		})),
		{
			articleClass: "article",
			divClass: "div",
			div2Class: "div2",
			div3Class: "div3",
			imgClass: "img",
			ulClass: "ul",
			liClass: "li"
		}
	);

	const styling = $.derived(() => $$props.classes ?? {
		article: $$props.articleClass,
		div: $$props.divClass,
		div2: $$props.div2Class,
		div3: $$props.div3Class,
		img: $$props.imgClass,
		ul: $$props.ulClass,
		li: $$props.liClass
	});

	const theme = $.derived(() => getTheme("review"));

	const $$d = $.derived(reviewVariants),
		article = $.derived(() => $.get($$d).article),
		div = $.derived(() => $.get($$d).div),
		div2 = $.derived(() => $.get($$d).div2),
		div3 = $.derived(() => $.get($$d).div3),
		img = $.derived(() => $.get($$d).img),
		ul = $.derived(() => $.get($$d).ul),
		li = $.derived(() => $.get($$d).li);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_10 = ($$anchor) => {
			var article_1 = root_4();
			var div_1 = $.child(article_1);
			var div_2 = $.child(div_1);
			var img_1 = $.child(div_2);
			var div_3 = $.sibling(img_1, 2);
			var p = $.child(div_3);
			var text = $.only_child(p, true);
			var node_1 = $.sibling(p, 2);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					{
						var consequent = ($$anchor) => {
							var div_4 = root();
							var node_3 = $.child(div_4);

							$.snippet(node_3, () => $$props.address);
							$.reset(div_4);

							$.template_effect(($0) => $.set_class(div_4, 1, $0), [
								() => $.clsx($.get(div3)({ class: clsx($.get(theme)?.div3, $.get(styling).div3) }))
							]);

							$.append($$anchor, div_4);
						};

						$.if(node_2, ($$render) => {
							if ($$props.address) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_1);
				};

				$.if(node_1, ($$render) => {
					if ($$props.review.address) $$render(consequent_1);
				});
			}

			$.reset(div_3);
			$.reset(div_2);

			var node_4 = $.sibling(div_2, 2);

			{
				var consequent_8 = ($$anchor) => {
					var ul_1 = root_2();
					var node_5 = $.child(ul_1);

					{
						var consequent_3 = ($$anchor) => {
							var li_1 = root_1();
							var node_6 = $.child(li_1);

							{
								var consequent_2 = ($$anchor) => {
									var fragment_2 = $.comment();
									var node_7 = $.first_child(fragment_2);

									$.snippet(node_7, () => $$props.item1);
									$.append($$anchor, fragment_2);
								};

								$.if(node_6, ($$render) => {
									if ($$props.item1) $$render(consequent_2);
								});
							}

							$.reset(li_1);

							$.template_effect(($0) => $.set_class(li_1, 1, $0), [
								() => $.clsx($.get(li)({ class: clsx($.get(theme)?.li, $.get(styling).li) }))
							]);

							$.append($$anchor, li_1);
						};

						$.if(node_5, ($$render) => {
							if ($$props.review.item1) $$render(consequent_3);
						});
					}

					var node_8 = $.sibling(node_5, 2);

					{
						var consequent_5 = ($$anchor) => {
							var li_2 = root_1();
							var node_9 = $.child(li_2);

							{
								var consequent_4 = ($$anchor) => {
									var fragment_3 = $.comment();
									var node_10 = $.first_child(fragment_3);

									$.snippet(node_10, () => $$props.item2);
									$.append($$anchor, fragment_3);
								};

								$.if(node_9, ($$render) => {
									if ($$props.item2) $$render(consequent_4);
								});
							}

							$.reset(li_2);
							$.template_effect(($0) => $.set_class(li_2, 1, $0), [() => $.clsx(clsx($.get(styling).li))]);
							$.append($$anchor, li_2);
						};

						$.if(node_8, ($$render) => {
							if ($$props.review.item2) $$render(consequent_5);
						});
					}

					var node_11 = $.sibling(node_8, 2);

					{
						var consequent_7 = ($$anchor) => {
							var li_3 = root_1();
							var node_12 = $.child(li_3);

							{
								var consequent_6 = ($$anchor) => {
									var fragment_4 = $.comment();
									var node_13 = $.first_child(fragment_4);

									$.snippet(node_13, () => $$props.item3);
									$.append($$anchor, fragment_4);
								};

								$.if(node_12, ($$render) => {
									if ($$props.item3) $$render(consequent_6);
								});
							}

							$.reset(li_3);
							$.template_effect(($0) => $.set_class(li_3, 1, $0), [() => $.clsx(clsx($.get(styling).li))]);
							$.append($$anchor, li_3);
						};

						$.if(node_11, ($$render) => {
							if ($$props.review.item3) $$render(consequent_7);
						});
					}

					$.reset(ul_1);

					$.template_effect(($0) => $.set_class(ul_1, 1, $0), [
						() => $.clsx($.get(ul)({ class: clsx($.get(theme)?.ul, $.get(styling).ul) }))
					]);

					$.append($$anchor, ul_1);
				};

				$.if(node_4, ($$render) => {
					if ($$props.review.item1 || $$props.review.item2 || $$props.review.item3) $$render(consequent_8);
				});
			}

			$.reset(div_1);

			var div_5 = $.sibling(div_1, 2);
			var div_6 = $.child(div_5);
			var div_7 = $.child(div_6);
			var node_14 = $.child(div_7);

			{
				var consequent_9 = ($$anchor) => {
					var footer = root_3();
					var p_1 = $.child(footer);
					var text_1 = $.only_child(p_1);

					$.reset(footer);
					$.template_effect(() => $.set_text(text_1, `Reviewed: ${$$props.review.reviewDate ?? ''}`));
					$.append($$anchor, footer);
				};

				$.if(node_14, ($$render) => {
					if ($$props.review.reviewDate) $$render(consequent_9);
				});
			}

			var h4 = $.sibling(node_14, 2);
			var text_2 = $.only_child(h4, true);

			$.reset(div_7);

			var p_2 = $.sibling(div_7, 2);
			var text_3 = $.only_child(p_2, true);

			$.reset(div_6);

			var node_15 = $.sibling(div_6, 2);

			$.snippet(node_15, () => $$props.children);
			$.reset(div_5);
			$.reset(article_1);

			$.template_effect(
				($0, $1, $2, $3) => {
					$.set_class(article_1, 1, $0);
					$.set_class(div_2, 1, $1);
					$.set_class(img_1, 1, $2);
					$.set_attribute(img_1, 'src', $$props.review.imgSrc);
					$.set_attribute(img_1, 'alt', $$props.review.imgAlt);
					$.set_class(div_3, 1, $3);
					$.set_text(text, $$props.review.name);
					$.set_text(text_2, $$props.review.title);
					$.set_text(text_3, $$props.review.rating);
				},
				[
					() => $.clsx($.get(article)({ class: clsx($.get(theme)?.article, $.get(styling).article) })),
					() => $.clsx($.get(div)({ class: clsx($.get(theme)?.div, $.get(styling).div) })),
					() => $.clsx($.get(img)({ class: clsx($.get(theme)?.img, $.get(styling).img) })),
					() => $.clsx($.get(div2)({ class: clsx($.get(theme)?.div2, $.get(styling).div2) }))
				]
			);

			$.append($$anchor, article_1);
		};

		$.if(node, ($$render) => {
			if ($$props.review) $$render(consequent_10);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}