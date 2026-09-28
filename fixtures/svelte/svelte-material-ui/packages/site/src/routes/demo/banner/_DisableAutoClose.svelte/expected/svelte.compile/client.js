import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Banner, { Label } from '@smui/banner';
import Button from '@smui/button';
import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<pre class="status"> </pre> <div class="top-app-bar-container"><!> <!> <div><img alt="Page content placeholder" src="/page-content.jpg" style="display: block; max-width: 100%; height: auto; margin: 1em auto;"/></div></div>`, 1);

export default function _DisableAutoClose($$anchor) {
	const actions = { [0]: 'Primary', [1]: 'Secondary', [2]: 'Unknown' };
	let action = $.state('None yet');

	function handleActionClicked(event) {
		$.set(action, actions[event.detail.action], true);
	}

	var fragment = root_1();
	var pre = $.first_child(fragment);
	var text = $.only_child(pre);
	var div = $.sibling(pre, 2);
	var node = $.child(div);

	TopAppBar(node, {
		variant: 'static',
		children: ($$anchor, $$slotProps) => {
			Row($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Section($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Title($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Top App Bar');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	{
		const label = ($$anchor) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('This is a banner with actions to click.');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		};

		const actions = ($$anchor) => {
			var fragment_5 = root();
			var node_2 = $.first_child(fragment_5);

			Button(node_2, {
				secondary: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Secondary');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Primary');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_5);
		};

		Banner(node_1, {
			open: true,
			autoClose: false,
			onSMUIBannerActionClicked: handleActionClicked,
			label,
			actions,
			$$slots: { label: true, actions: true }
		});
	}

	$.next(2);
	$.reset(div);
	$.template_effect(() => $.set_text(text, `Action Clicked: ${$.get(action) ?? ''}`));
	$.append($$anchor, fragment);
}