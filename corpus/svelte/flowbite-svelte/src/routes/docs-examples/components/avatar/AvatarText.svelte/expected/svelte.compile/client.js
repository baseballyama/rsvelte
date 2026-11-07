import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar } from "flowbite-svelte";

var root = $.from_html(`<div class="flex items-center space-x-4 rtl:space-x-reverse"><!> <div class="space-y-1 font-medium dark:text-white"><div>Jese Leos</div> <div class="text-sm text-gray-500 dark:text-gray-400">Joined in August 2014</div></div></div>`);

export default function AvatarText($$anchor) {
	var div = root();
	var node = $.child(div);

	Avatar(node, {
		src: '/images/profile-picture-1.webp',
		cornerStyle: 'rounded'
	});

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
}