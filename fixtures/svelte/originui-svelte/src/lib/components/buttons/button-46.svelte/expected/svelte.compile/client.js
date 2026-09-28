import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';

var root = $.from_html(`Show less <!>`, 1);
var root_1 = $.from_html(`Show more <!>`, 1);

export default function Button_46($$anchor) {
	let isExpanded = $.state(false);

	function toggleExpand() {
		$.set(isExpanded, !$.get(isExpanded));
	}

	Button($$anchor, {
		class: 'gap-1',
		variant: 'ghost',
		onclick: toggleExpand,
		get 'aria-expanded'() {
			return $.get(isExpanded);
		},
		'aria-controls': 'expandable-content',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = root();
					var node_1 = $.sibling($.first_child(fragment_2));

					ChevronUpIcon(node_1, {
						className: '-me-1',
						size: 16,
						'stroke-width': '2',
						'aria-hidden': 'true'
					});

					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var fragment_3 = root_1();
					var node_2 = $.sibling($.first_child(fragment_3));

					ChevronDownIcon(node_2, {
						className: '-me-1',
						size: 16,
						'stroke-width': '2',
						'aria-hidden': 'true'
					});

					$.append($$anchor, fragment_3);
				};

				$.if(node, ($$render) => {
					if ($.get(isExpanded)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}