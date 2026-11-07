import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useElementMounted } from '$hooks/useElementMounted';
import { fade } from 'svelte/transition';
import { customSlide } from './customSlide';
import BurgerIcon from './BurgerIcon.svelte';
import Search from '$components/Search/Search.svelte';

var root = $.from_html(`<div class="relative w-full pt-4 pb-8"><!></div>`);
var root_1 = $.from_html(`<div class="border-b-orange/25 -z-10 min-h-0 w-full overflow-auto border-b bg-[#0a0F19]"><div class="px-6 pt-2 pb-6"><!> <!></div></div>`);
var root_2 = $.from_html(`<div class="fixed top-0 left-0 z-40 flex max-h-screen w-full flex-col md:hidden"><header><div><!></div> <div class="max-w-[30%]"></div> <div class="flex flex-row items-center justify-end gap-4"><div><!></div> <!></div></header> <!></div> <div class="h-[var(--docs-navbar-height)]"></div>`, 1);

export default function MobileNav($$anchor, $$props) {
	$.push($$props, true);

	const $mounted = () => $.store_get(mounted, '$mounted', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let search = $.prop($$props, 'search', 3, false);
	let showMenu = $.state(false);
	const { action, mounted } = useElementMounted();
	var fragment = root_2();
	var div = $.first_child(fragment);
	var header = $.child(div);
	var div_1 = $.child(header);
	var node = $.child(div_1);

	$.snippet(node, () => $$props.topbarLeft ?? $.noop);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 4);
	var div_3 = $.child(div_2);
	var node_1 = $.child(div_3);

	$.snippet(node_1, () => $$props.topbarRight ?? $.noop);
	$.reset(div_3);

	var node_2 = $.sibling(div_3, 2);

	BurgerIcon(node_2, {
		get showMenu() {
			return $.get(showMenu);
		},

		set showMenu($$value) {
			$.set(showMenu, $$value, true);
		}
	});

	$.reset(div_2);
	$.reset(header);

	var node_3 = $.sibling(header, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_4 = root_1();
			var div_5 = $.child(div_4);
			var node_4 = $.child(div_5);

			{
				var consequent = ($$anchor) => {
					var div_6 = root();
					var node_5 = $.child(div_6);

					Search(node_5, {});
					$.reset(div_6);
					$.append($$anchor, div_6);
				};

				$.if(node_4, ($$render) => {
					if (search()) $$render(consequent);
				});
			}

			var node_6 = $.sibling(node_4, 2);

			$.snippet(node_6, () => $$props.content ?? $.noop);
			$.reset(div_5);
			$.reset(div_4);
			$.action(div_4, ($$node) => action?.($$node));
			$.transition(1, div_5, () => fade, () => ({ delay: 200, duration: 200 }));
			$.transition(2, div_5, () => fade, () => ({ duration: 200 }));
			$.transition(2, div_4, () => customSlide, () => ({ delay: 200, duration: 200 }));
			$.transition(1, div_4, () => customSlide, () => ({ duration: 200 }));
			$.append($$anchor, div_4);
		};

		$.if(node_3, ($$render) => {
			if ($.get(showMenu)) $$render(consequent_1);
		});
	}

	$.reset(div);
	$.next(2);

	$.template_effect(() => $.set_class(header, 1, $.clsx([
		'flex h-[var(--docs-navbar-height)] w-full shrink-0 flex-row items-center justify-between border-b bg-[#0A0F19] px-6 py-2',
		$mounted() ? 'border-b-transparent' : 'border-b-orange/25'
	])));

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}