import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { melt } from '@melt-ui/svelte';
import { Card } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<!> <div class="separator"></div>`, 1);
var root_1 = $.from_html(`<div class="separator"></div> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div><!></div> <div class="subMenu svelte-1rwppfr"><!></div>`, 1);

export default function SubMenu($$anchor, $$props) {
	const $$slots = $.sanitize_slots($$props);

	$.push($$props, true);

	const $subTrigger = () => $.store_get(subTrigger, '$subTrigger', $$stores);
	const $subMenu = () => $.store_get(subMenu, '$subMenu', $$stores);
	const $separator = () => $.store_get(separator, '$separator', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	// get parent builder for toggle state!
	const { builders, separator } = getContext('menuBuilder');

	const { createSubmenu } = builders;
	const { elements: { subMenu, subTrigger } } = createSubmenu();
	var fragment = root_3();
	var div = $.first_child(fragment);
	var node = $.child(div);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(div);
	$.action(div, ($$node, $$action_arg) => melt?.($$node, $$action_arg), $subTrigger);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	$.component(node_1, () => Card.Base, ($$anchor, Card_Base) => {
		Card_Base($$anchor, {
			padding: 'none',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_2 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var fragment_2 = root();
						var node_3 = $.first_child(fragment_2);

						$.slot(node_3, $$props, 'start', {}, null);

						var div_2 = $.sibling(node_3, 2);

						$.action(div_2, ($$node, $$action_arg) => melt?.($$node, $$action_arg), $separator);
						$.append($$anchor, fragment_2);
					};

					$.if(node_2, ($$render) => {
						if ($$slots.start) $$render(consequent);
					});
				}

				var node_4 = $.sibling(node_2, 2);

				$.slot(node_4, $$props, 'menu', {}, null);

				var node_5 = $.sibling(node_4, 2);

				{
					var consequent_1 = ($$anchor) => {
						var fragment_3 = root_1();
						var div_3 = $.first_child(fragment_3);

						$.action(div_3, ($$node, $$action_arg) => melt?.($$node, $$action_arg), $separator);

						var node_6 = $.sibling(div_3, 2);

						$.slot(node_6, $$props, 'end', {}, null);
						$.append($$anchor, fragment_3);
					};

					$.if(node_5, ($$render) => {
						if ($$slots.end) $$render(consequent_1);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);
	$.action(div_1, ($$node, $$action_arg) => melt?.($$node, $$action_arg), $subMenu);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}