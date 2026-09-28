import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { getCarouselContext } from "$lib/context";
import { fly } from "svelte/transition";
import { slide } from "./theme";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'image',
	'transition',
	'fit',
	'class'
]);

var root = $.from_html(`<img/>`);

export default function Slide($$anchor, $$props) {
	$.push($$props, true);

	const _state = getCarouselContext();
	let restProps = $.rest_props($$props, rest_excludes);
	const theme = $.derived(() => getTheme("slide"));

	let transitionSlideIn = $.derived(() => ({
		x: _state?.forward ? "100%" : "-100%",
		opacity: 1,
		width: "100%",
		height: "100%",
		duration: _state?.slideDuration ?? 1000
	}));

	let transitionSlideOut = $.derived(() => ({
		x: _state?.forward ? "-100%" : "100%",
		opacity: 0.9,
		width: "100%",
		height: "100%",
		duration: _state?.slideDuration ?? 1000
	}));

	let imgClass = $.derived(() => slide({ fit: $$props.fit, class: clsx($.get(theme), $$props.class) }));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.key(node_1, () => $$props.image, ($$anchor) => {
				var img = root();

				$.attribute_effect(img, () => ({
					alt: '...',
					...$$props.image,
					...restProps,
					class: $.get(imgClass)
				}));

				$.replay_events(img);
				$.transition(3, img, () => $$props.transition, () => ({}));
				$.append($$anchor, img);
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.key(node_2, () => $$props.image, ($$anchor) => {
				var img_1 = root();

				$.attribute_effect(img_1, () => ({
					alt: '...',
					...$$props.image,
					...restProps,
					class: $.get(imgClass)
				}));

				$.replay_events(img_1);
				$.transition(2, img_1, () => fly, () => $.get(transitionSlideOut));
				$.transition(1, img_1, () => fly, () => $.get(transitionSlideIn));
				$.append($$anchor, img_1);
			});

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if ($$props.transition) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}