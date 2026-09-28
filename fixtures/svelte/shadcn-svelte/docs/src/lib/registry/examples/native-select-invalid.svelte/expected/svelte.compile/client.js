import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Native_select_invalid($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => NativeSelect.Root, ($$anchor, NativeSelect_Root) => {
		NativeSelect_Root($$anchor, {
			'aria-invalid': 'true',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => NativeSelect.Option, ($$anchor, NativeSelect_Option) => {
					NativeSelect_Option($$anchor, {
						value: '',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Select role');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_1) => {
					NativeSelect_Option_1($$anchor, {
						value: 'admin',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Admin');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_2) => {
					NativeSelect_Option_2($$anchor, {
						value: 'editor',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Editor');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_3, 2);

				$.component(node_4, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_3) => {
					NativeSelect_Option_3($$anchor, {
						value: 'viewer',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Viewer');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_4, 2);

				$.component(node_5, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_4) => {
					NativeSelect_Option_4($$anchor, {
						value: 'guest',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Guest');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}