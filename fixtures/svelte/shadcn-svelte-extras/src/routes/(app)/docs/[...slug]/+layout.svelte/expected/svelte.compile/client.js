import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DocsSidebar from '$lib/components/docs-sidebar.svelte';
import PageWrapper from '$lib/components/page-wrapper.svelte';
import { setupDocs } from '$lib/features/docs/docs-context.svelte';
import * as Sidebar from '$lib/components/ui/sidebar';

var root = $.from_html(`<!> <div class="h-full w-full"><!></div>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);
	setupDocs();

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Provider, ($$anchor, Sidebar_Provider) => {
		Sidebar_Provider($$anchor, {
			class: '3xl:fixed:container 3xl:fixed:px-3 min-h-min flex-1 items-start px-0 [--sidebar-width:220px] [--top-spacing:0] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:[--sidebar-width:240px] lg:[--top-spacing:calc(var(--spacing)*4)]',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				DocsSidebar(node_1, {});

				var div = $.sibling(node_1, 2);
				var node_2 = $.child(div);

				PageWrapper(node_2, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_3 = $.first_child(fragment_2);

						$.snippet(node_3, () => $$props.children);
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});

				$.reset(div);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}