import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Logo from './logo.svelte';
import { LightSwitch } from './ui/light-switch';
import LayoutToggle from './layout-toggle.svelte';
import { Separator } from './ui/separator';
import MobileSheet from './mobile-sheet.svelte';
import { GitHubButton, getStars } from './ui/github-button';
import { onMount } from 'svelte';

const HeaderLink = ($$anchor, $$arg0) => {
	let href = () => ($$arg0?.()).href;
	let name = () => ($$arg0?.()).name;
	var a = root();
	var text = $.only_child(a, true);

	$.template_effect(() => {
		$.set_attribute(a, 'href', href());
		$.set_text(text, name());
	});

	$.append($$anchor, a);
};

var root = $.from_html(`<a class="hover:bg-secondary flex h-7 items-center justify-center rounded-md px-2.5 text-sm transition-all"> </a>`);
var root_1 = $.from_html(`<header class="bg-background sticky top-0 z-10 flex flex-col items-center"><div class="site-container flex h-(--header-height) w-full items-center justify-between"><!> <div class="hidden items-center md:flex"><a href="/"><!></a> <!> <!> <!> <!></div> <div class="flex items-center gap-2 **:data-[slot=separator]:h-4!"><!> <!> <!> <!> <!></div></div></header>`);

export default function Site_header($$anchor, $$props) {
	$.push($$props, true);

	const STARS_FALLBACK = 525;
	let stars = $.state(STARS_FALLBACK);
	const repo = { owner: 'ieedan', repo: 'shadcn-svelte-extras' };

	onMount(async () => {
		$.set(stars, await getStars({ ...repo, fallback: STARS_FALLBACK }), true);
	});

	var header = root_1();
	var div = $.child(header);
	var node = $.child(div);

	MobileSheet(node, {});

	var div_1 = $.sibling(node, 2);
	var a_1 = $.child(div_1);
	var node_1 = $.child(a_1);

	Logo(node_1, { class: 'mr-2 size-6' });
	$.reset(a_1);

	var node_2 = $.sibling(a_1, 2);

	HeaderLink(node_2, () => ({ href: '/docs', name: 'Docs' }));

	var node_3 = $.sibling(node_2, 2);

	HeaderLink(node_3, () => ({ href: '/components', name: 'Components' }));

	var node_4 = $.sibling(node_3, 2);

	HeaderLink(node_4, () => ({ href: '/hooks', name: 'Hooks' }));

	var node_5 = $.sibling(node_4, 2);

	HeaderLink(node_5, () => ({ href: '/actions', name: 'Actions' }));
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_6 = $.child(div_2);

	GitHubButton(node_6, {
		variant: 'ghost',
		size: 'sm',
		get repo() {
			return repo;
		},

		get stars() {
			return $.get(stars);
		}
	});

	var node_7 = $.sibling(node_6, 2);

	Separator(node_7, { orientation: 'vertical' });

	var node_8 = $.sibling(node_7, 2);

	LayoutToggle(node_8, { class: 'hidden xl:flex' });

	var node_9 = $.sibling(node_8, 2);

	Separator(node_9, { orientation: 'vertical', class: 'hidden xl:block' });

	var node_10 = $.sibling(node_9, 2);

	LightSwitch(node_10, { variant: 'ghost', size: 'sm' });
	$.reset(div_2);
	$.reset(div);
	$.reset(header);
	$.append($$anchor, header);
	$.pop();
}