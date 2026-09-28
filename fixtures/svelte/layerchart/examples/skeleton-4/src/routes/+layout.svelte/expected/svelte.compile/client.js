import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Switch } from '@skeletonlabs/skeleton-svelte';
import { ModeWatcher, mode, setMode } from 'mode-watcher';
import favicon from '$lib/assets/favicon.svg';
import '../app.css';

var root = $.from_html(`<link rel="icon"/>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <main class="p-4"><div class="pb-4 text-right"><!></div> <!></main>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_2();

	$.head('sznme2', ($$anchor) => {
		var link = root();

		$.template_effect(() => $.set_attribute(link, 'href', favicon));
		$.append($$anchor, link);
	});

	var node = $.first_child(fragment);

	ModeWatcher(node, { defaultTheme: 'cerberus' });

	var main = $.sibling(node, 2);
	var div = $.child(main);
	var node_1 = $.child(div);

	{
		let $0 = $.derived(() => mode.current === 'dark');

		Switch(node_1, {
			get checked() {
				return $.get($0);
			},
			onCheckedChange: (e) => setMode(e.checked ? 'dark' : 'light'),
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_2 = $.first_child(fragment_1);

				$.component(node_2, () => Switch.Control, ($$anchor, Switch_Control) => {
					Switch_Control($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Switch.Thumb, ($$anchor, Switch_Thumb) => {
								Switch_Thumb($$anchor, {});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_2, 2);

				$.component(node_4, () => Switch.HiddenInput, ($$anchor, Switch_HiddenInput) => {
					Switch_HiddenInput($$anchor, {});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);

	var node_5 = $.sibling(div, 2);

	$.snippet(node_5, () => $$props.children ?? $.noop);
	$.reset(main);
	$.append($$anchor, fragment);
	$.pop();
}