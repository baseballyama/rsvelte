import * as $ from 'svelte/internal/server';
import { Linkedin, Twitter, Youtube } from "$lib/components/icons";
import { Button } from "$lib/components/ui/veil/button";

export default function Social_media_one($$renderer) {
	const socials = [
		{ id: "twitter", label: "Twitter", href: "#", icon: Twitter },
		{ id: "linkedin", label: "LinkedIn", href: "#", icon: Linkedin },
		{ id: "youtube", label: "YouTube", href: "#", icon: Youtube }
	];

	let hoveredSocialMedia = null;

	const tooltipLabel = $.derived(() => {
		switch (hoveredSocialMedia ?? "twitter") {
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

	$$renderer.push(`<div class="flex w-fit flex-col items-end"><div class="-mr-2 mb-2 flex"><!--[-->`);

	const each_array = $.ensure_array_like(socials);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		Button($$renderer, {
			href: item.href,
			target: '_blank',
			rel: 'noopener noreferrer',
			referrerpolicy: 'no-referrer',
			size: 'icon',
			variant: 'ghost',
			'aria-label': "Follow us on " + item.label,
			'aria-pressed': hoveredSocialMedia === item.id,
			class: hoveredSocialMedia === item.id ? "text-foreground" : "",
			onmouseenter: () => hoveredSocialMedia = item.id,
			onmouseleave: () => hoveredSocialMedia = null,
			onfocus: () => hoveredSocialMedia = item.id,
			onblur: () => hoveredSocialMedia = null,
			children: ($$renderer) => {
				if (item.icon) {
					$$renderer.push('<!--[-->');
					item.icon($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});
	}

	$$renderer.push(`<!--]--></div> <div aria-live="polite"${$.attr_class('w-fit text-xs leading-none text-muted-foreground transition-opacity duration-200', void 0, {
		'opacity-100': hoveredSocialMedia !== null,
		'opacity-0': hoveredSocialMedia === null
	})}>${$.escape(tooltipLabel())}</div></div>`);
}