import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
import CogIcon from '@lucide/svelte/icons/cog';
import HouseIcon from '@lucide/svelte/icons/house';

var root = $.from_html(`<ol class="flex items-center gap-4"><li><a class="opacity-60 hover:opacity-100" href="#"><!></a></li> <li class="opacity-50" aria-hidden=""><!></li> <li><a class="opacity-60 hover:opacity-100" href="#"><!></a></li> <li class="opacity-50" aria-hidden=""><!></li> <li>Current</li></ol>`);

export default function Icons($$anchor) {
	var ol = root();
	var li = $.child(ol);
	var a = $.child(li);
	var node = $.child(a);

	HouseIcon(node, { size: 24 });
	$.reset(a);
	$.reset(li);

	var li_1 = $.sibling(li, 2);
	var node_1 = $.child(li_1);

	ChevronRightIcon(node_1, { size: 14 });
	$.reset(li_1);

	var li_2 = $.sibling(li_1, 2);
	var a_1 = $.child(li_2);
	var node_2 = $.child(a_1);

	CogIcon(node_2, { size: 24 });
	$.reset(a_1);
	$.reset(li_2);

	var li_3 = $.sibling(li_2, 2);
	var node_3 = $.child(li_3);

	ChevronRightIcon(node_3, { size: 14 });
	$.reset(li_3);
	$.next(2);
	$.reset(ol);
	$.append($$anchor, ol);
}