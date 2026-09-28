import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Footer from '$lib/demo/layout/footer.svelte';
import '../app.css';
import Header from '$lib/demo/layout/header.svelte';
import interVariableWoff2 from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2';
import { page } from '$app/state';
import { ModeWatcher } from 'mode-watcher';

var root = $.from_html(`<link rel="preload" as="font" type="font/woff2" crossorigin="anonymous"/>`);
var root_1 = $.from_html(`<!> <div class="overflow-hidden px-4 supports-[overflow:clip]:overflow-clip sm:px-6" data-vaul-drawer-wrapper=""><div class="before:bg-[linear-gradient(to_bottom,--theme(--color-svelte/.3),--theme(--color-border)_200px,--theme(--color-border)_calc(100%-200px),--theme(--color-svelte/.3))] after:bg-[linear-gradient(to_bottom,--theme(--color-svelte/.3),--theme(--color-border)_200px,--theme(--color-border)_calc(100%-200px),--theme(--color-svelte/.3))] relative mx-auto w-full max-w-6xl before:absolute before:inset-y-0 before:-left-12 before:w-px after:absolute after:inset-y-0 after:-right-12 after:w-px"><div class="relative flex min-h-screen flex-col"><!> <!> <!></div></div></div>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_1();

	$.head('12qhfyh', ($$anchor) => {
		var link = root();

		$.template_effect(() => $.set_attribute(link, 'href', interVariableWoff2));
		$.append($$anchor, link);
	});

	var node = $.first_child(fragment);

	ModeWatcher(node, { defaultMode: 'system' });

	var div = $.sibling(node, 2);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node_1 = $.child(div_2);

	Header(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	$.snippet(node_2, () => $$props.children);

	var node_3 = $.sibling(node_2, 2);

	Footer(node_3, {
		get footerLinks() {
			return $$props.data.footerLinks;
		}
	});

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_attribute(div, 'data-home', page.url.pathname === '/'));
	$.append($$anchor, fragment);
	$.pop();
}