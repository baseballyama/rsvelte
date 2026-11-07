import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Thumbnail from "./Thumbnail.svelte";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { thumbnails } from "./theme";

var root = $.from_html(`<button><!></button>`);
var root_1 = $.from_html(`<div></div>`);

export default function Thumbnails($$anchor, $$props) {
	$.push($$props, true);

	let images = $.prop($$props, 'images', 19, () => []),
		index = $.prop($$props, 'index', 15),
		ariaLabel = $.prop($$props, 'ariaLabel', 3, "Click to view image"),
		throttleDelay = $.prop($$props, 'throttleDelay', 3, 650);

	const theme = $.derived(() => getTheme("thumbnails"));

	// Initialize so the first click is never throttled
	let lastClickedAt = -Infinity;

	const btnClick = (newIndex) => {
		const now = Date.now();

		if (now - lastClickedAt < throttleDelay()) {
			console.warn("Thumbnail action throttled");

			return;
		}

		lastClickedAt = now;
		index(newIndex);
	};

	$.user_effect(() => {
		if (images().length > 0) {
			index((index() + images().length) % images().length);
		}
	});

	var div = root_1();

	$.each(div, 23, images, (image, idx) => image.src || idx, ($$anchor, image, idx) => {
		const selected = $.derived(() => index() === $.get(idx));
		var button = root();
		var node = $.child(button);

		{
			var consequent = ($$anchor) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				{
					let $0 = $.derived(() => ({
						image: $.get(image),
						selected: $.get(selected),
						imgClass: clsx($$props.imgClass),
						Thumbnail
					}));

					$.snippet(node_1, () => $$props.children, () => $.get($0));
				}

				$.append($$anchor, fragment);
			};

			var alternate = ($$anchor) => {
				{
					let $0 = $.derived(() => clsx($$props.imgClass));

					Thumbnail($$anchor, $.spread_props(() => $.get(image), {
						get selected() {
							return $.get(selected);
						},

						get class() {
							return $.get($0);
						}
					}));
				}
			};

			$.if(node, ($$render) => {
				if ($$props.children) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.reset(button);

		$.template_effect(() => {
			$.set_attribute(button, 'aria-label', ariaLabel());
			$.set_attribute(button, 'aria-current', $.get(selected) ? "true" : undefined);
		});

		$.delegated('click', button, () => btnClick($.get(idx)));
		$.append($$anchor, button);
	});

	$.reset(div);

	$.template_effect(($0) => $.set_class(div, 1, $0), [
		() => $.clsx(thumbnails({ class: clsx($.get(theme), $$props.class) }))
	]);

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);