import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as DocTabs from "./doc-tabs/index.js";
import CodeTabs from "./code-tabs.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="-ms-2 md:ms-0"><!></div>`);

export default function Install_tabs($$anchor, $$props) {
	var div = root_2();
	var node = $.child(div);

	CodeTabs(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => DocTabs.List, ($$anchor, DocTabs_List) => {
				DocTabs_List($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => DocTabs.Trigger, ($$anchor, DocTabs_Trigger) => {
							DocTabs_Trigger($$anchor, {
								value: 'cli',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('CLI');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => DocTabs.Trigger, ($$anchor, DocTabs_Trigger_1) => {
							DocTabs_Trigger_1($$anchor, {
								value: 'manual',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Manual');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_4 = $.sibling(node_1, 2);

			$.component(node_4, () => DocTabs.Content, ($$anchor, DocTabs_Content) => {
				DocTabs_Content($$anchor, {
					value: 'cli',
					class: 'ms-2 md:ms-0',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_5 = $.first_child(fragment_2);

						$.snippet(node_5, () => $$props.cli ?? $.noop);
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_6 = $.sibling(node_4, 2);

			$.component(node_6, () => DocTabs.Content, ($$anchor, DocTabs_Content_1) => {
				DocTabs_Content_1($$anchor, {
					class: 'ms-2 md:ms-0',
					value: 'manual',
					'data-manual-install': '',
					'data-llm-ignore': true,
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_7 = $.first_child(fragment_3);

						$.snippet(node_7, () => $$props.manual ?? $.noop);
						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}