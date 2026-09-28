import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AvatarImg01 from '$assets/avatar-80-03.jpg?w=160&h=160&enhanced';
import AvatarImg02 from '$assets/avatar-80-05.jpg?w=160&h=160&enhanced';
import AvatarImg03 from '$assets/avatar-80-06.jpg?w=160&h=160&enhanced';
import AvatarImg04 from '$assets/avatar-80-07.jpg?w=160&h=160&enhanced';

var root = $.from_html(`<div class="flex -space-x-6"><enhanced:img class="ring-background size-20 rounded-full ring-2" alt="Avatar 01" loading="lazy" decoding="async"></enhanced:img> <enhanced:img class="ring-background size-20 rounded-full ring-2" alt="Avatar 02" loading="lazy" decoding="async"></enhanced:img> <enhanced:img class="ring-background size-20 rounded-full ring-2" alt="Avatar 03" loading="lazy" decoding="async"></enhanced:img> <enhanced:img class="ring-background size-20 rounded-full ring-2" alt="Avatar 04" loading="lazy" decoding="async"></enhanced:img></div>`);

export default function Avatar_19($$anchor) {
	var div = root();
	var enhanced_img = $.child(div);
	var enhanced_img_1 = $.sibling(enhanced_img, 2);
	var enhanced_img_2 = $.sibling(enhanced_img_1, 2);
	var enhanced_img_3 = $.sibling(enhanced_img_2, 2);

	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(enhanced_img, 'src', AvatarImg01);
		$.set_attribute(enhanced_img_1, 'src', AvatarImg02);
		$.set_attribute(enhanced_img_2, 'src', AvatarImg03);
		$.set_attribute(enhanced_img_3, 'src', AvatarImg04);
	});

	$.append($$anchor, div);
}