import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pane, Splitpanes } from 'svelte-splitpanes';

var root = $.from_html(`<p>MenuBar - This is a splitpane, note how the splitters made static using CSS</p>`);
var root_1 = $.from_html(`<p>ToolBar - This is another fixed size, locked splitpane</p>`);
var root_2 = $.from_html(`<p>Folder <br/> You can move those --&gt;</p>`);
var root_3 = $.from_html(`<p>Sample content</p>`);
var root_4 = $.from_html(`<p>Details <br/> &lt;-- You can move those</p>`);
var root_5 = $.from_html(`<!> <!> <!>`, 1);
var root_6 = $.from_html(`<p>statusbar - and yet, another splitpane, same technique</p>`);
var root_7 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Code($$anchor) {
	Splitpanes($$anchor, {
		theme: 'no-splitter',
		horizontal: true,
		style: 'height: 400px',
		dblClickSplitter: false,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_7();
			var node = $.first_child(fragment_1);

			Pane(node, {
				size: 6,
				minSize: 6,
				maxSize: 6,
				children: ($$anchor, $$slotProps) => {
					var p = root();

					$.append($$anchor, p);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Pane(node_1, {
				size: 6,
				minSize: 6,
				maxSize: 6,
				children: ($$anchor, $$slotProps) => {
					var p_1 = root_1();

					$.append($$anchor, p_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Pane(node_2, {
				children: ($$anchor, $$slotProps) => {
					Splitpanes($$anchor, {
						theme: 'modern-theme',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_5();
							var node_3 = $.first_child(fragment_3);

							Pane(node_3, {
								children: ($$anchor, $$slotProps) => {
									var p_2 = root_2();

									$.append($$anchor, p_2);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							Pane(node_4, {
								children: ($$anchor, $$slotProps) => {
									var p_3 = root_3();

									$.append($$anchor, p_3);
								},
								$$slots: { default: true }
							});

							var node_5 = $.sibling(node_4, 2);

							Pane(node_5, {
								children: ($$anchor, $$slotProps) => {
									var p_4 = root_4();

									$.append($$anchor, p_4);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_2, 2);

			Pane(node_6, {
				size: 6,
				minSize: 6,
				maxSize: 6,
				children: ($$anchor, $$slotProps) => {
					var p_5 = root_6();

					$.append($$anchor, p_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}