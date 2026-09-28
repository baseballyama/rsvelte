import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FloatingActionBar, Icon, Layout } from '@appwrite.io/pink-svelte';
import { IconExclamationCircle, IconExclamation } from '@appwrite.io/pink-icons-svelte';

var root = $.from_html(`<!> <div class="sonner-message svelte-1y4xpqh"> </div>`, 1);
var root_1 = $.from_html(`<div class="floating-action-bar svelte-1y4xpqh"><!></div>`);

export default function ErrorSonner($$anchor, $$props) {
	let severity = $.prop($$props, 'severity', 3, 'error');
	const properIcon = $.derived(() => severity() === 'warning' ? IconExclamation : IconExclamationCircle);
	const iconColor = $.derived(() => severity() === 'warning' ? '--fgcolor-warning' : '--fgcolor-error');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root_1();
			var node_1 = $.child(div);

			FloatingActionBar(node_1, {
				$$slots: {
					start: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack) => {
							Layout_Stack($$anchor, {
								inline: true,
								gap: 's',
								direction: 'row',
								alignItems: 'center',
								style: 'width: max-content;',
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root();
									var node_3 = $.first_child(fragment_2);

									Icon(node_3, {
										get icon() {
											return $.get(properIcon);
										},

										get color() {
											return $.get(iconColor);
										}
									});

									var div_1 = $.sibling(node_3, 2);
									var text = $.only_child(div_1, true);

									$.template_effect(() => $.set_text(text, $$props.message));
									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					}
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.message) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}