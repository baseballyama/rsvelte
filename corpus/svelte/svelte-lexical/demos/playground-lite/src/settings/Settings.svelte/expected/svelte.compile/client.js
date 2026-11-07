import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { isDevPlayground } from './appSettings';
import Switch from '../ui/Switch.svelte';

var root = $.from_html(`<div class="switches svelte-1txr692"><!> <!> <!> <!> <!></div>`);
var root_1 = $.from_html(`<button id="options-button" aria-label="Toggle settings"></button> <!>`, 1);

export default function Settings($$anchor, $$props) {
	$.push($$props, true);

	const $settings = () => $.store_get(settings, '$settings', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const settings = getContext('settings');
	const windowLocation = window.location;
	let showSettings = $.state(false);
	const parentWindow = window.parent;
	const search = windowLocation.search;
	const isSplitScreen = parentWindow && parentWindow.location.pathname === '/split/';
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					Switch($$anchor, {
						onclick: () => {
							settings.setOption('isCollab', !$settings().isCollab);
							window.location.reload();
						},

						get checked() {
							return $settings().isCollab;
						},
						text: 'Collaboration'
					});
				};

				$.if(node_1, ($$render) => {
					if ($settings().isRichText && isDevPlayground) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					Switch($$anchor, {
						onclick: () => {
							if (isSplitScreen) {
								window.parent.location.href = `/${search}`;
							} else {
								window.location.href = `/split/${search}`;
							}
						},

						get checked() {
							return isSplitScreen;
						},
						text: 'Split Screen'
					});
				};

				$.if(node_2, ($$render) => {
					if (isDevPlayground) $$render(consequent_1);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			Switch(node_3, {
				onclick: () => settings.setOption('showTreeView', !$settings().showTreeView),
				get checked() {
					return $settings().showTreeView;
				},
				text: 'Debug View'
			});

			var node_4 = $.sibling(node_3, 2);

			Switch(node_4, {
				onclick: () => {
					settings.setOption('isRichText', !$settings().isRichText);
					settings.setOption('isCollab', false);
				},

				get checked() {
					return $settings().isRichText;
				},
				text: 'Rich Text'
			});

			var node_5 = $.sibling(node_4, 2);

			Switch(node_5, {
				onclick: () => {
					settings.setOption('isCodeHighlighted', !$settings().isCodeHighlighted);
				},

				get checked() {
					return $settings().isCodeHighlighted;
				},
				text: 'Enable Code Highlighting'
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(showSettings)) $$render(consequent_2);
		});
	}

	$.template_effect(() => $.set_class(button, 1, `editor-dev-button ${$.get(showSettings) ? 'active' : ''}`, 'svelte-1txr692'));
	$.delegated('click', button, () => $.set(showSettings, !$.get(showSettings)));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);