import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Fuse from 'fuse.js';
import Icon from '$lib/components/Icon.svelte';
import { convertFileSrc } from '@tauri-apps/api/core';
import { invoke } from '@tauri-apps/api/core';

var root = $.from_html(`<img alt="" class="size-4"/>`);
var root_1 = $.from_html(`<button type="button"><div class="flex size-5 shrink-0 items-center justify-center"><!></div> <div class="flex flex-col"><span class="font-medium"> </span> <span class="text-muted-foreground text-sm"> </span></div> <span class="text-muted-foreground ml-auto text-xs whitespace-nowrap">System App</span></button>`);

export default function AppList($$anchor, $$props) {
	$.push($$props, true);

	const fuse = $.derived(() => new Fuse($$props.apps, { keys: ['name', 'comment', 'exec'], threshold: 0.4 }));

	const filteredApps = $.derived(() => {
		if (!$$props.searchText) return $$props.apps;

		return $.get(fuse).search($$props.searchText).map((result) => result.item);
	});

	function getFilteredApps() {
		return $.get(filteredApps);
	}

	function handleClick(index) {
		const absoluteIndex = $$props.startIndex + index;

		$$props.onItemClick(absoluteIndex);

		const app = $.get(filteredApps)[index];

		if (app && app.exec) {
			invoke('launch_app', { exec: app.exec }).catch(console.error);
		}
	}

	var $$exports = { getFilteredApps };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 19, () => $.get(filteredApps), (app) => app.name, ($$anchor, app, index) => {
		const absoluteIndex = $.derived(() => $$props.startIndex + $.get(index));
		var button = root_1();
		let classes;
		var div = $.child(button);
		var node_1 = $.child(div);

		{
			var consequent = ($$anchor) => {
				var img = root();

				$.template_effect(($0) => $.set_attribute(img, 'src', $0), [() => convertFileSrc($.get(app).icon_path)]);
				$.append($$anchor, img);
			};

			var alternate = ($$anchor) => {
				Icon($$anchor, { icon: 'app-window-16', class: 'size-4' });
			};

			$.if(node_1, ($$render) => {
				if ($.get(app).icon_path) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.reset(div);

		var div_1 = $.sibling(div, 2);
		var span = $.child(div_1);
		var text = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_1 = $.only_child(span_1, true);

		$.reset(div_1);
		$.next(2);
		$.reset(button);

		$.template_effect(() => {
			classes = $.set_class(button, 1, 'hover:bg-accent/50 flex w-full items-center gap-3 px-4 py-2 text-left', null, classes, { 'bg-accent': $$props.selectedIndex === $.get(absoluteIndex) });
			$.set_text(text, $.get(app).name);
			$.set_text(text_1, $.get(app).comment || 'No description');
		});

		$.delegated('click', button, () => handleClick($.get(index)));
		$.append($$anchor, button);
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}

$.delegate(['click']);