import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Linkedin, Twitter, Youtube } from "$lib/components/icons";
import { Button } from "$lib/components/ui/veil/button";

var root = $.from_html(`<div class="flex w-fit flex-col items-end"><div class="-mr-2 mb-2 flex"></div> <div aria-live="polite"> </div></div>`);

export default function Social_media_one($$anchor) {
	const socials = [
		{ id: "twitter", label: "Twitter", href: "#", icon: Twitter },
		{ id: "linkedin", label: "LinkedIn", href: "#", icon: Linkedin },
		{ id: "youtube", label: "YouTube", href: "#", icon: Youtube }
	];

	let hoveredSocialMedia = $.state(null);

	const tooltipLabel = $.derived(() => {
		switch ($.get(hoveredSocialMedia) ?? "twitter") {
			case "twitter":
				return "Follow us on Twitter";

			case "linkedin":
				return "Follow us on LinkedIn";

			case "youtube":
				return "Follow us on YouTube";

			default:
				return "Follow us";
		}
	});

	var div = root();
	var div_1 = $.child(div);

	$.each(div_1, 21, () => socials, (item) => item.id, ($$anchor, item) => {
		{
			let $0 = $.derived(() => "Follow us on " + $.get(item).label);
			let $1 = $.derived(() => $.get(hoveredSocialMedia) === $.get(item).id);
			let $2 = $.derived(() => $.get(hoveredSocialMedia) === $.get(item).id ? "text-foreground" : "");

			Button($$anchor, {
				get href() {
					return $.get(item).href;
				},
				target: '_blank',
				rel: 'noopener noreferrer',
				referrerpolicy: 'no-referrer',
				size: 'icon',
				variant: 'ghost',
				get 'aria-label'() {
					return $.get($0);
				},

				get 'aria-pressed'() {
					return $.get($1);
				},

				get class() {
					return $.get($2);
				},
				onmouseenter: () => $.set(hoveredSocialMedia, $.get(item).id, true),
				onmouseleave: () => $.set(hoveredSocialMedia, null),
				onfocus: () => $.set(hoveredSocialMedia, $.get(item).id, true),
				onblur: () => $.set(hoveredSocialMedia, null),
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node = $.first_child(fragment_1);

					$.component(node, () => $.get(item).icon, ($$anchor, item_icon) => {
						item_icon($$anchor, {});
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		}
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	let classes;
	var text = $.only_child(div_2, true);

	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(div_2, 1, 'w-fit text-xs leading-none text-muted-foreground transition-opacity duration-200', null, classes, {
			'opacity-100': $.get(hoveredSocialMedia) !== null,
			'opacity-0': $.get(hoveredSocialMedia) === null
		});

		$.set_text(text, $.get(tooltipLabel));
	});

	$.append($$anchor, div);
}