import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import './layout.css';
import LightSwitch from './light-switch.svelte';
import { LocaleProvider } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<a class="anchor"> </a>`);
var root_1 = $.from_html(`<div class="grid h-screen grid-cols-[320px_minmax(0,1fr)]"><div class="bg-surface-100-900 space-y-8 overflow-y-auto p-8"><header class="flex justify-between items-center"><a class="inline-block text-sm bg-orange-500 p-2 font-mono font-bold text-white">skeleton-svelte</a> <!></header> <hr class="hr"/> <div class="flex flex-col gap-4"><div class="font-bold">Components</div> <nav class="text-sm flex flex-col gap-1"></nav></div></div> <main class="space-y-8 overflow-y-auto p-8 pb-96"><!></main></div>`);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const components = Object.keys(import.meta.glob('/src/routes/components/*/+page.svelte')).map((path) => {
		const href = path.replace('/src/routes', '').replace('/+page.svelte', '');
		const name = href.split('/').pop().split('-').map((str) => str.charAt(0).toUpperCase() + str.slice(1)).join(' ');

		return { href, name };
	});

	LocaleProvider($$anchor, {
		locale: 'ar-SA',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var div_1 = $.child(div);
			var header = $.child(div_1);
			var a = $.child(header);
			var node = $.sibling(a, 2);

			LightSwitch(node, {});
			$.reset(header);

			var div_2 = $.sibling(header, 4);
			var nav = $.sibling($.child(div_2), 2);

			$.each(nav, 21, () => components, (component) => component.href, ($$anchor, component) => {
				var a_1 = root();
				var text = $.only_child(a_1, true);

				$.template_effect(() => {
					$.set_attribute(a_1, 'href', $.get(component).href);
					$.set_text(text, $.get(component).name);
				});

				$.append($$anchor, a_1);
			});

			$.reset(nav);
			$.reset(div_2);
			$.reset(div_1);

			var main = $.sibling(div_1, 2);
			var node_1 = $.child(main);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.reset(main);
			$.reset(div);
			$.template_effect(($0) => $.set_attribute(a, 'href', $0), [() => resolve('/')]);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}