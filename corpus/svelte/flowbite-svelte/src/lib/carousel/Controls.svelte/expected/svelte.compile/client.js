import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ControlButton from "./ControlButton.svelte";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { getCarouselContext } from "$lib/context";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<!> <!>`, 1);

export default function Controls($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const theme = $.derived(() => getTheme("controlButton"));
	const _state = getCarouselContext();

	function changeSlide(forward) {
		if (!_state) return;

		_state.changeSlide(forward ? _state.index + 1 : _state.index - 1);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children, () => changeSlide);
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = root();
			var node_2 = $.first_child(fragment_2);

			{
				let $0 = $.derived(() => clsx($.get(theme), $$props.class));

				ControlButton(node_2, $.spread_props(
					{
						name: 'Previous',
						forward: false,
						onclick: () => changeSlide(false),
						get class() {
							return $.get($0);
						}
					},
					() => restProps
				));
			}

			var node_3 = $.sibling(node_2, 2);

			{
				let $0 = $.derived(() => clsx($.get(theme), $$props.class));

				ControlButton(node_3, $.spread_props(
					{
						name: 'Next',
						forward: true,
						onclick: () => changeSlide(true),
						get class() {
							return $.get($0);
						}
					},
					() => restProps
				));
			}

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}