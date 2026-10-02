import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Indicator from "$lib/indicator/Indicator.svelte";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { getCarouselContext } from "$lib/context";
import { carouselIndicators } from "./theme";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'activeClass',
	'inactiveClass',
	'position',
	'class'
]);

var root = $.from_html(`<button type="button"><!></button>`);
var root_1 = $.from_html(`<div></div>`);

export default function CarouselIndicators($$anchor, $$props) {
	$.push($$props, true);

	let position = $.prop($$props, 'position', 3, "bottom"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("carouselIndicators"));
	const _state = getCarouselContext();

	const $$d = $.derived(() => carouselIndicators({ position: position() })),
		base = $.derived(() => $.get($$d).base),
		indicator = $.derived(() => $.get($$d).indicator);

	function goToIndex(newIndex) {
		_state?.changeSlide(newIndex);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_1();

			$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [
				() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
			]);

			$.each(div, 21, () => _state.images, $.index, ($$anchor, _, idx) => {
				const selected = $.derived(() => _state.index === idx);
				var button = root();

				$.set_attribute(button, 'aria-label', `Go to slide ${idx + 1}`);

				var node_1 = $.child(button);

				{
					var consequent = ($$anchor) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						$.snippet(node_2, () => $$props.children, () => ({ selected: $.get(selected), index: idx }));
						$.append($$anchor, fragment_1);
					};

					var alternate = ($$anchor) => {
						{
							let $0 = $.derived(() => $.get(indicator)({
								selected: $.get(selected),
								class: clsx($.get(selected) ? $$props.activeClass : $$props.inactiveClass, $.get(theme)?.indicator)
							}));

							Indicator($$anchor, {
								get class() {
									return $.get($0);
								}
							});
						}
					};

					$.if(node_1, ($$render) => {
						if ($$props.children) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.reset(button);
				$.template_effect(() => $.set_attribute(button, 'aria-current', $.get(selected) ? "true" : undefined));
				$.delegated('click', button, () => goToIndex(idx));
				$.append($$anchor, button);
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (_state) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);