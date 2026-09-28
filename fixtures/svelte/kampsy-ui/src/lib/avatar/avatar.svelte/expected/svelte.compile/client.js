import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	avatarBase,
	avatarImageBase,
	letterBase,
	placeholderBase,
	sizeStyle,
	fontSizeStyle
} from "./styles.js";

import { resolveAvatarSrc, normalizeLetter, shouldShowImage } from "./utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'size',
	'src',
	'username',
	'letter',
	'placeholder',
	'title',
	'class'
]);

var root = $.from_html(`<span><img loading="eager" decoding="async"/></span>`);
var root_1 = $.from_html(`<span> </span>`);
var root_2 = $.from_html(`<span></span>`);

export default function Avatar($$anchor, $$props) {
	$.push($$props, true);

	let size = $.prop($$props, 'size', 3, 32),
		placeholder = $.prop($$props, 'placeholder', 3, false),
		rest = $.rest_props($$props, rest_excludes);

	let resolvedTitle = $.derived(() => $$props.title || $$props.username);
	let resolvedSrc = $.derived(() => resolveAvatarSrc({ src: $$props.src, username: $$props.username }, size()));
	let resolvedLetter = $.derived(() => normalizeLetter($$props.letter));
	let img = $.state(void 0);
	let erroredSrc = $.state(undefined);

	function onError() {
		$.set(erroredSrc, $.get(resolvedSrc), true);
	}

	let showImage = $.derived(() => shouldShowImage($.get(resolvedSrc), $.get(erroredSrc)));
	let showLetter = $.derived(() => !$.get(showImage) && $.get(resolvedLetter) && !placeholder());
	let showPlaceholder = $.derived(() => placeholder() || !$.get(showImage) && !$.get(showLetter));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var span = root();

			$.attribute_effect(
				span,
				($0) => ({
					...rest,
					class: [avatarBase, $$props.class],
					style: $0,
					title: $.get(resolvedTitle)
				}),
				[() => sizeStyle(size())]
			);

			var img_1 = $.child(span);

			$.bind_this(img_1, ($$value) => $.set(img, $$value), () => $.get(img));
			$.reset(span);

			$.template_effect(() => {
				$.set_attribute(img_1, 'src', $.get(resolvedSrc));
				$.set_attribute(img_1, 'alt', $.get(resolvedTitle) ? `${$.get(resolvedTitle)}'s avatar` : "Avatar");
				$.set_class(img_1, 1, $.clsx(avatarImageBase));
				$.set_attribute(img_1, 'width', size());
				$.set_attribute(img_1, 'height', size());
			});

			$.event('error', img_1, onError);
			$.replay_events(img_1);
			$.append($$anchor, span);
		};

		var consequent_1 = ($$anchor) => {
			var span_1 = root_1();

			$.attribute_effect(
				span_1,
				($0, $1) => ({
					...rest,
					class: [letterBase, $$props.class],
					style: `${$0 ?? ''}${$1 ?? ''}`,
					title: $.get(resolvedTitle),
					'aria-label': $.get(resolvedTitle)
						? `Avatar with initials: ${$.get(resolvedLetter)} for ${$.get(resolvedTitle)}`
						: `Avatar with initials: ${$.get(resolvedLetter)}`
				}),
				[() => sizeStyle(size()), () => fontSizeStyle(size())]
			);

			var text = $.only_child(span_1, true);

			$.template_effect(() => $.set_text(text, $.get(resolvedLetter)));
			$.append($$anchor, span_1);
		};

		var consequent_2 = ($$anchor) => {
			var span_2 = root_2();

			$.attribute_effect(
				span_2,
				($0) => ({
					...rest,
					class: [placeholderBase, $$props.class],
					style: $0,
					'aria-label': 'Avatar placeholder'
				}),
				[() => sizeStyle(size())]
			);

			$.append($$anchor, span_2);
		};

		$.if(node, ($$render) => {
			if ($.get(showImage)) $$render(consequent); else if ($.get(showLetter)) $$render(consequent_1, 1); else if ($.get(showPlaceholder)) $$render(consequent_2, 2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}