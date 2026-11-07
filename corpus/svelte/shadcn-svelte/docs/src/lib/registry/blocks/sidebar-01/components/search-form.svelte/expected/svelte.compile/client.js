import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SearchIcon from "@lucide/svelte/icons/search";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<form><!></form>`);

export default function Search_form($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var form = root_1();

	$.attribute_effect(form, () => ({ ...restProps }));

	var node = $.child(form);

	$.component(node, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
		Sidebar_Group($$anchor, {
			class: 'py-0',
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
					Sidebar_GroupContent($$anchor, {
						class: 'relative',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							Label(node_2, {
								for: 'search',
								class: 'sr-only',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Search');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Sidebar.Input, ($$anchor, Sidebar_Input) => {
								Sidebar_Input($$anchor, {
									id: 'search',
									placeholder: 'Search the docs...',
									class: 'ps-8'
								});
							});

							var node_4 = $.sibling(node_3, 2);

							SearchIcon(node_4, {
								class: 'pointer-events-none absolute start-2 top-1/2 size-4 -translate-y-1/2 opacity-50 select-none'
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(form);
	$.bind_this(form, ($$value) => ref($$value), () => ref());
	$.append($$anchor, form);
	$.pop();
}