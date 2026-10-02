import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LeftSidebarCategory from './LeftSidebarCategory.svelte';

var root = $.from_html(`<li class="mb-6 text-sm"><!></li>`);
var root_1 = $.from_html(`<nav class="relative hidden h-full w-full pr-2 pl-6 md:block"><ul id="sidebar-scrollwindow" class="mt-0 block h-full overflow-x-hidden overflow-y-scroll pb-24 lg:pt-6"></ul></nav>`);

export default function LeftSidebar($$anchor, $$props) {
	$.push($$props, true);

	var nav = root_1();
	var ul = $.child(nav);

	$.each(ul, 21, () => $$props.menu[$$props.activeSidebarTab].categories, $.index, ($$anchor, category) => {
		var li = root();
		var node = $.child(li);

		LeftSidebarCategory(node, {
			get category() {
				return $.get(category);
			},

			get activeUrlPathName() {
				return $$props.activeUrlPathName;
			},

			get baseUrl() {
				return $$props.baseUrl;
			}
		});

		$.reset(li);
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(nav);
	$.append($$anchor, nav);
	$.pop();
}