import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MinusIcon from '@lucide/svelte/icons/minus';
import PlusIcon from '@lucide/svelte/icons/plus';
import { Collapsible } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<span>Toggle</span> <!>`, 1);

export default function Indicator($$anchor) {
	Collapsible($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
				Collapsible_Content($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('The world dies over and over again, but the skeleton always gets up and walks. Every heart has its own skeletons. The bones of the\n		skeleton which support the body can become the bars of the cage which imprison the spirit.');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
				Collapsible_Trigger($$anchor, {
					class: 'btn preset-filled',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_2 = $.sibling($.first_child(fragment_2), 2);

						$.component(node_2, () => Collapsible.Indicator, ($$anchor, Collapsible_Indicator) => {
							Collapsible_Indicator($$anchor, {
								class: 'group',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_3 = $.first_child(fragment_3);

									MinusIcon(node_3, { class: 'size-4 group-data-[state=open]:block hidden' });

									var node_4 = $.sibling(node_3, 2);

									PlusIcon(node_4, { class: 'size-4 group-data-[state=open]:hidden block' });
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}