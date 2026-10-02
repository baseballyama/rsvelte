import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AvatarImg01 from '$assets/avatar-80-03.jpg?w=80&h=80&enhanced';
import AvatarImg02 from '$assets/avatar-80-05.jpg?w=80&h=80&enhanced';
import AvatarImg03 from '$assets/avatar-80-06.jpg?w=80&h=80&enhanced';
import AvatarImg04 from '$assets/avatar-80-07.jpg?w=80&h=80&enhanced';

var root = $.from_html(`<div class="border-border bg-background flex items-center rounded-full border p-1 shadow-sm shadow-black/5"><div class="flex -space-x-1.5"><enhanced:img class="ring-background size-5 rounded-full ring-1" alt="Avatar 01" loading="lazy" decoding="async"></enhanced:img> <enhanced:img class="ring-background size-5 rounded-full ring-1" alt="Avatar 02" loading="lazy" decoding="async"></enhanced:img> <enhanced:img class="ring-background size-5 rounded-full ring-1" alt="Avatar 03" loading="lazy" decoding="async"></enhanced:img> <enhanced:img class="ring-background size-5 rounded-full ring-1" alt="Avatar 04" loading="lazy" decoding="async"></enhanced:img></div> <p class="text-muted-foreground px-2 text-xs">Trusted by <strong class="text-foreground font-medium">60K+</strong> developers.</p></div>`);

export default function Avatar_23($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var enhanced_img = $.child(div_1);
	var enhanced_img_1 = $.sibling(enhanced_img, 2);
	var enhanced_img_2 = $.sibling(enhanced_img_1, 2);
	var enhanced_img_3 = $.sibling(enhanced_img_2, 2);

	$.reset(div_1);
	$.next(2);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(enhanced_img, 'src', AvatarImg01);
		$.set_attribute(enhanced_img_1, 'src', AvatarImg02);
		$.set_attribute(enhanced_img_2, 'src', AvatarImg03);
		$.set_attribute(enhanced_img_3, 'src', AvatarImg04);
	});

	$.append($$anchor, div);
}