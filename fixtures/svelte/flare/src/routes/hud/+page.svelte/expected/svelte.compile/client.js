import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';

var root = $.from_html(`<div class="rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white"> </div>`);
var root_1 = $.from_html(`<div class="flex h-screen items-center justify-center bg-transparent"><!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let hudText = $.state('');
	let hudEl = $.state(null);

	listen('hud-message', (event) => {
		$.set(hudText, event.payload, true);
	});

	$.user_effect(() => {
		const resizeObserver = new ResizeObserver((entries) => {
			entries.forEach((entry) => {
				const bounds = entry.contentRect;
				const window = getCurrentWindow();

				window.setMinSize(new LogicalSize(bounds.width, bounds.height));
				window.setMaxSize(new LogicalSize(bounds.width, bounds.height));
				window.setSize(new LogicalSize(bounds.width, bounds.height));
				window.center();
			});
		});

		resizeObserver.observe($.get(hudEl));

		return () => {
			resizeObserver.disconnect();
		};
	});

	var div = root_1();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var text = $.only_child(div_1, true);

			$.bind_this(div_1, ($$value) => $.set(hudEl, $$value), () => $.get(hudEl));
			$.template_effect(() => $.set_text(text, $.get(hudText)));
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($.get(hudText)) $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}