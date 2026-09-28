import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import Star from "./Star.svelte";
import { rating as ratingVariants } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'text',
	'class',
	'classes',
	'size',
	'total',
	'rating',
	'icon',
	'count',
	'pClass'
]);

var root = $.from_html(`<!> <p> </p> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div><!></div>`);

export default function Rating($$anchor, $$props) {
	$.push($$props, true);

	let size = $.prop($$props, 'size', 3, 24),
		total = $.prop($$props, 'total', 3, 5),
		rating = $.prop($$props, 'rating', 3, 4),
		Icon = $.prop($$props, 'icon', 3, Star),
		count = $.prop($$props, 'count', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation("Rating", untrack(() => ({ pClass: $$props.pClass })), { pClass: "p" });

	const styling = $.derived(() => $$props.classes ?? { p: $$props.pClass });
	const theme = $.derived(() => getTheme("rating"));

	const $$d = $.derived(ratingVariants),
		base = $.derived(() => $.get($$d).base),
		p = $.derived(() => $.get($$d).p);

	const ratingGroupId = crypto.randomUUID();
	let clampedRating = $.derived(() => Math.max(0, Math.min(rating(), total())));
	let fullStars = $.derived(() => Math.floor($.get(clampedRating)));
	let rateDifference = $.derived(() => $.get(clampedRating) - $.get(fullStars));
	let percentRating = $.derived(() => Math.round($.get(rateDifference) * 100));
	let grayStars = $.derived(() => total() - ($.get(fullStars) + Math.ceil($.get(rateDifference))));
	var div = root_2();

	$.attribute_effect(div, ($0) => ({ ...restProps, class: $0 }), [
		() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
	]);

	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			$.component(node_1, Icon, ($$anchor, Icon_1) => {
				Icon_1($$anchor, {
					fillPercent: 100,
					get size() {
						return size();
					},
					iconIndex: 0,
					get groupId() {
						return ratingGroupId;
					}
				});
			});

			var p_1 = $.sibling(node_1, 2);
			var text_1 = $.only_child(p_1, true);
			var node_2 = $.sibling(p_1, 2);

			$.snippet(node_2, () => $$props.children);

			$.template_effect(
				($0) => {
					$.set_class(p_1, 1, $0);
					$.set_text(text_1, rating());
				},
				[
					() => $.clsx($.get(p)({ class: clsx($.get(theme)?.p, $.get(styling).p) }))
				]
			);

			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_1();
			var node_3 = $.first_child(fragment_1);

			$.each(node_3, 17, () => Array($.get(fullStars)), $.index, ($$anchor, _, i) => {
				var fragment_2 = $.comment();
				var node_4 = $.first_child(fragment_2);

				{
					let $0 = $.derived(() => `rating-${ratingGroupId}-full`);

					$.component(node_4, Icon, ($$anchor, Icon_2) => {
						Icon_2($$anchor, {
							get size() {
								return size();
							},
							fillPercent: 100,
							iconIndex: i,
							get groupId() {
								return $.get($0);
							}
						});
					});
				}

				$.append($$anchor, fragment_2);
			});

			var node_5 = $.sibling(node_3, 2);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_6 = $.first_child(fragment_3);

					{
						let $0 = $.derived(() => `rating-${ratingGroupId}-partial`);

						$.component(node_6, Icon, ($$anchor, Icon_3) => {
							Icon_3($$anchor, {
								get size() {
									return size();
								},

								get fillPercent() {
									return $.get(percentRating);
								},

								get iconIndex() {
									return $.get(fullStars);
								},

								get groupId() {
									return $.get($0);
								}
							});
						});
					}

					$.append($$anchor, fragment_3);
				};

				$.if(node_5, ($$render) => {
					if ($.get(percentRating)) $$render(consequent_1);
				});
			}

			var node_7 = $.sibling(node_5, 2);

			$.each(node_7, 17, () => Array($.get(grayStars)), $.index, ($$anchor, _, i) => {
				var fragment_4 = $.comment();
				var node_8 = $.first_child(fragment_4);

				{
					let $0 = $.derived(() => `rating-${ratingGroupId}-empty`);

					$.component(node_8, Icon, ($$anchor, Icon_4) => {
						Icon_4($$anchor, {
							get size() {
								return size();
							},
							fillPercent: 0,
							iconIndex: i,
							get groupId() {
								return $.get($0);
							}
						});
					});
				}

				$.append($$anchor, fragment_4);
			});

			var node_9 = $.sibling(node_7, 2);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_5 = $.comment();
					var node_10 = $.first_child(fragment_5);

					$.snippet(node_10, () => $$props.text);
					$.append($$anchor, fragment_5);
				};

				$.if(node_9, ($$render) => {
					if ($$props.text) $$render(consequent_2);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (count() && $$props.children) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}