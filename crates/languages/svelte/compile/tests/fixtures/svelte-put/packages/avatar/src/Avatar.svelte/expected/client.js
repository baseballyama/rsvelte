import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolveAlt, resolveSize, resolveSrc, DEFINITIVE_FALLBACK } from './avatar.utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'src',
	'gravatar',
	'uiAvatar',
	'fallback',
	'size',
	'alt',
	'class',
	'img'
]);

var root = $.from_html(`<img/>`);

export default function Avatar($$anchor, $$props) {
	$.push($$props, true);

	/** @type {import('./types.public').AvatarProps} */
	let cls = $.prop($$props, 'class', 3, ''),
		rest = $.rest_props($$props, rest_excludes);

	let rAlt = $.derived(() => resolveAlt($$props.alt, $$props.gravatar, $$props.uiAvatar, $$props.src));
	let rSize = $.derived(() => resolveSize(32, $$props.size, $$props.src, $$props.gravatar, $$props.uiAvatar));
	let sources = $.derived(() => resolveSrc($$props.src, $$props.gravatar, $$props.uiAvatar, $$props.fallback));
	let rSrc = $.state($.proxy(DEFINITIVE_FALLBACK));

	/** @type {HTMLImageElement | undefined} */
	let element = $.state(undefined);

	$.user_effect(() => {
		let rElement = $.get(element);

		if ($$props.img) {
			rElement = new Image();
			rElement.style.display = 'none';
			document.body.appendChild(rElement);
		}

		let currentSourceIndex = 0;

		if (rElement) {
			rElement.addEventListener('error', () => {
				if (currentSourceIndex < $.get(sources).length - 1) {
					currentSourceIndex++;
					rElement.src = $.set(rSrc, $.get(sources)[currentSourceIndex], true);
				} else {
					rElement.src = $.set(rSrc, DEFINITIVE_FALLBACK, true);
				}
			});

			rElement.src = $.set(rSrc, $.get(sources)[currentSourceIndex] ?? DEFINITIVE_FALLBACK, true);
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.img, () => ({
				src: $.get(rSrc),
				size: $.get(rSize),
				alt: $.get(rAlt),
				sources: $.get(sources)
			}));

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var img_1 = root();

			$.attribute_effect(
				img_1,
				($0) => ({
					src: $.get(rSrc),
					alt: $.get(rAlt),
					height: $.get(rSize),
					width: $.get(rSize),
					class: `svelte-put-avatar ${cls() ?? ''}`,
					'data-sources': $0,
					...rest
				}),
				[() => $.get(sources).join(',')]
			);

			$.bind_this(img_1, ($$value) => $.set(element, $$value), () => $.get(element));
			$.replay_events(img_1);
			$.append($$anchor, img_1);
		};

		$.if(node, ($$render) => {
			if ($$props.img) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}