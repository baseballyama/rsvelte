import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "carbon-components-svelte/Button/Button.svelte";
import ComboBox from "carbon-components-svelte/ComboBox/ComboBox.svelte";
import DataTable from "carbon-components-svelte/DataTable/DataTable.svelte";
import Dropdown from "carbon-components-svelte/Dropdown/Dropdown.svelte";
import IconIndicator from "carbon-components-svelte/IconIndicator/IconIndicator.svelte";
import OverflowMenu from "carbon-components-svelte/OverflowMenu/OverflowMenu.svelte";
import OverflowMenuItem from "carbon-components-svelte/OverflowMenu/OverflowMenuItem.svelte";
import ProgressIndicator from "carbon-components-svelte/ProgressIndicator/ProgressIndicator.svelte";
import ProgressStep from "carbon-components-svelte/ProgressIndicator/ProgressStep.svelte";
import ShapeIndicator from "carbon-components-svelte/ShapeIndicator/ShapeIndicator.svelte";
import Tab from "carbon-components-svelte/Tabs/Tab.svelte";
import TabContent from "carbon-components-svelte/Tabs/TabContent.svelte";
import Tabs from "carbon-components-svelte/Tabs/Tabs.svelte";
import Theme from "carbon-components-svelte/Theme/Theme.svelte";

var root = $.from_html(`<span></span>`);
var root_1 = $.from_html(`<pre> </pre>`);
var root_2 = $.from_html(`<span> </span>`);
var root_3 = $.from_html(`<span data-testid="dropdown-custom-label">Custom label content</span>`);
var root_4 = $.from_html(`<span data-testid="icon-indicator-custom-label">Custom label content</span>`);
var root_5 = $.from_html(`<span data-testid="shape-indicator-custom-label">Custom label content</span>`);
var root_6 = $.from_html(`<span>L</span>`);
var root_7 = $.from_html(`<span>R</span>`);
var root_8 = $.from_html(`<span data-testid="overflow-item-icon-left">L</span>`);
var root_9 = $.from_html(`<span data-testid="overflow-item-icon-right">R</span>`);
var root_10 = $.from_html(`<div>Custom Button Element</div>`);
var root_11 = $.from_html(`<div data-testid="theme-value"> </div>`);
var root_12 = $.from_html(`<span data-testid="progress-step-icon-1">1</span>`);
var root_13 = $.from_html(`<span data-testid="progress-step-icon-2">2</span>`);
var root_14 = $.from_html(`<span data-testid="progress-step-icon-3">3</span>`);
var root_15 = $.from_html(`<!> <!> <!>`, 1);
var root_16 = $.from_html(`<span data-testid="tab-secondary-label-snippet">(12/16)</span>`);
var root_17 = $.from_html(`<!> <!>`, 1);
var root_18 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <div data-testid="theme-snippet"><!></div> <!> <!>`, 1);

export default function Snippets_test($$anchor) {
	const items = [
		{ id: "1", text: "Option 1" },
		{ id: "2", text: "Option 2" },
		{ id: "3", text: "Option 3" }
	];

	const dataTableHeaders = [
		{ key: "name", value: "Name" },
		{ key: "protocol", value: "Protocol" }
	];

	const dataTableRows = [
		{ id: "a", name: "Load Balancer 1", protocol: "HTTP" },
		{ id: "b", name: "Load Balancer 2", protocol: "HTTPS" }
	];

	var fragment = root_18();
	var node = $.first_child(fragment);

	{
		const expandIcon = ($$anchor, $$arg0) => {
			let expanded = () => ($$arg0?.()).expanded;
			let row = () => ($$arg0?.()).row;
			let props = () => ($$arg0?.()).props;
			var span = root();

			$.attribute_effect(span, () => ({
				'data-testid': 'datatable-expand-icon-snippet',
				...props(),
				'data-expanded': expanded()
			}));

			$.append($$anchor, span);
		};

		const expandedRow = ($$anchor, $$arg0) => {
			let row = () => ($$arg0?.()).row;
			let _rowSelected = () => ($$arg0?.()).rowSelected;
			var pre = root_1();
			var text = $.only_child(pre, true);

			$.template_effect(($0) => $.set_text(text, $0), [() => JSON.stringify(row(), null, 2)]);
			$.append($$anchor, pre);
		};

		DataTable(node, {
			'data-testid': 'datatable-expand-icon-snippet-container',
			expandable: true,
			get headers() {
				return dataTableHeaders;
			},

			get rows() {
				return dataTableRows;
			},
			expandIcon,
			expandedRow,
			$$slots: { expandIcon: true, expandedRow: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let item = () => ($$arg0?.()).item;
			let index = () => ($$arg0?.()).index;
			let selected = () => ($$arg0?.()).selected;
			let highlighted = () => ($$arg0?.()).highlighted;
			var span_1 = root_2();
			var text_1 = $.only_child(span_1);

			$.template_effect(() => {
				$.set_attribute(span_1, 'data-testid', `dropdown-item-${index() ?? ''}`);
				$.set_attribute(span_1, 'data-selected', selected());
				$.set_attribute(span_1, 'data-highlighted', highlighted());

				$.set_text(text_1, `${item().text ?? ''}
      (#${index() ?? ''})`);
			});

			$.append($$anchor, span_1);
		};

		Dropdown(node_1, {
			'data-testid': 'dropdown-snippet',
			get items() {
				return items;
			},
			selectedId: '1',
			children,
			$$slots: { default: true }
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		const labelChildren = ($$anchor) => {
			var span_2 = root_3();

			$.append($$anchor, span_2);
		};

		Dropdown(node_2, {
			'data-testid': 'dropdown-label-children',
			get items() {
				return items;
			},
			selectedId: '1',
			labelChildren,
			$$slots: { labelChildren: true }
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		const labelChildren = ($$anchor) => {
			var span_3 = root_4();

			$.append($$anchor, span_3);
		};

		IconIndicator(node_3, {
			'data-testid': 'icon-indicator-label-children',
			kind: 'succeeded',
			label: 'Succeeded',
			labelChildren,
			$$slots: { labelChildren: true }
		});
	}

	var node_4 = $.sibling(node_3, 2);

	{
		const labelChildren = ($$anchor) => {
			var span_4 = root_5();

			$.append($$anchor, span_4);
		};

		ShapeIndicator(node_4, {
			'data-testid': 'shape-indicator-label-children',
			kind: 'stable',
			label: 'Stable',
			labelChildren,
			$$slots: { labelChildren: true }
		});
	}

	var node_5 = $.sibling(node_4, 2);

	{
		const icon = ($$anchor, $$arg0) => {
			let item = () => ($$arg0?.()).item;
			var span_5 = root_6();

			$.template_effect(() => $.set_attribute(span_5, 'data-testid', `dropdown-icon-${item().id ?? ''}`));
			$.append($$anchor, span_5);
		};

		const iconRight = ($$anchor, $$arg0) => {
			let item = () => ($$arg0?.()).item;
			let selected = () => ($$arg0?.()).selected;
			var span_6 = root_7();

			$.template_effect(() => {
				$.set_attribute(span_6, 'data-testid', `dropdown-icon-right-${item().id ?? ''}`);
				$.set_attribute(span_6, 'data-selected', selected());
			});

			$.append($$anchor, span_6);
		};

		Dropdown(node_5, {
			'data-testid': 'dropdown-icon-snippets',
			get items() {
				return items;
			},
			selectedId: '1',
			icon,
			iconRight,
			$$slots: { icon: true, iconRight: true }
		});
	}

	var node_6 = $.sibling(node_5, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let item = () => ($$arg0?.()).item;
			let index = () => ($$arg0?.()).index;
			let selected = () => ($$arg0?.()).selected;
			var span_7 = root_2();
			var text_2 = $.only_child(span_7);

			$.template_effect(() => {
				$.set_attribute(span_7, 'data-testid', `combobox-item-${index() ?? ''}`);
				$.set_attribute(span_7, 'data-selected', selected());

				$.set_text(text_2, `${item().text ?? ''}
      - index ${index() ?? ''}`);
			});

			$.append($$anchor, span_7);
		};

		ComboBox(node_6, {
			'data-testid': 'combobox-snippet',
			get items() {
				return items;
			},
			selectedId: '2',
			children,
			$$slots: { default: true }
		});
	}

	var node_7 = $.sibling(node_6, 2);

	OverflowMenu(node_7, {
		'data-testid': 'overflow-menu-snippet',
		open: true,
		children: ($$anchor, $$slotProps) => {
			{
				const icon = ($$anchor) => {
					var span_8 = root_8();

					$.append($$anchor, span_8);
				};

				const iconRight = ($$anchor) => {
					var span_9 = root_9();

					$.append($$anchor, span_9);
				};

				OverflowMenuItem($$anchor, {
					text: 'Edit',
					icon,
					iconRight,
					$$slots: { icon: true, iconRight: true }
				});
			}
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Button(node_8, {
		'data-testid': 'button-snippet',
		as: true,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const props = $.derived(() => $$slotProps.props);
				var div = root_10();

				$.attribute_effect(div, () => ({ ...$.get(props), 'data-testid': 'custom-button' }));
				$.append($$anchor, div);
			}
		}
	});

	var div_1 = $.sibling(node_8, 2);
	var node_9 = $.child(div_1);

	{
		const children = ($$anchor, $$arg0) => {
			let theme = () => ($$arg0?.()).theme;
			var div_2 = root_11();
			var text_3 = $.only_child(div_2);

			$.template_effect(() => $.set_text(text_3, `Current theme: ${theme() ?? ''}`));
			$.append($$anchor, div_2);
		};

		Theme(node_9, { children, $$slots: { default: true } });
	}

	$.reset(div_1);

	var node_10 = $.sibling(div_1, 2);

	ProgressIndicator(node_10, {
		'data-testid': 'progress-step-icon-snippet',
		currentIndex: 1,
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_15();
			var node_11 = $.first_child(fragment_2);

			{
				const icon = ($$anchor, $$arg0) => {
					let complete = () => ($$arg0?.()).complete;
					let current = () => ($$arg0?.()).current;
					let invalid = () => ($$arg0?.()).invalid;
					var span_10 = root_12();

					$.template_effect(() => {
						$.set_attribute(span_10, 'data-complete', complete());
						$.set_attribute(span_10, 'data-current', current());
						$.set_attribute(span_10, 'data-invalid', invalid());
					});

					$.append($$anchor, span_10);
				};

				ProgressStep(node_11, {
					complete: true,
					label: 'Step 1',
					description: 'Completed',
					icon,
					$$slots: { icon: true }
				});
			}

			var node_12 = $.sibling(node_11, 2);

			{
				const icon = ($$anchor, $$arg0) => {
					let complete = () => ($$arg0?.()).complete;
					let current = () => ($$arg0?.()).current;
					let invalid = () => ($$arg0?.()).invalid;
					var span_11 = root_13();

					$.template_effect(() => {
						$.set_attribute(span_11, 'data-complete', complete());
						$.set_attribute(span_11, 'data-current', current());
						$.set_attribute(span_11, 'data-invalid', invalid());
					});

					$.append($$anchor, span_11);
				};

				ProgressStep(node_12, {
					label: 'Step 2',
					description: 'Current',
					icon,
					$$slots: { icon: true }
				});
			}

			var node_13 = $.sibling(node_12, 2);

			{
				const icon = ($$anchor, $$arg0) => {
					let complete = () => ($$arg0?.()).complete;
					let current = () => ($$arg0?.()).current;
					let invalid = () => ($$arg0?.()).invalid;
					var span_12 = root_14();

					$.template_effect(() => {
						$.set_attribute(span_12, 'data-complete', complete());
						$.set_attribute(span_12, 'data-current', current());
						$.set_attribute(span_12, 'data-invalid', invalid());
					});

					$.append($$anchor, span_12);
				};

				ProgressStep(node_13, {
					invalid: true,
					label: 'Step 3',
					description: 'Invalid',
					icon,
					$$slots: { icon: true }
				});
			}

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_10, 2);

	Tabs(node_14, {
		type: 'container',
		'data-testid': 'tabs-secondary-label-snippet',
		'aria-label': 'Secondary label tabs',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_17();
			var node_15 = $.first_child(fragment_3);

			Tab(node_15, { label: 'Engage', secondaryLabel: '(21/25)' });

			var node_16 = $.sibling(node_15, 2);

			{
				const secondaryChildren = ($$anchor) => {
					var span_13 = root_16();

					$.append($$anchor, span_13);
				};

				Tab(node_16, {
					label: 'Analyze',
					secondaryChildren,
					$$slots: { secondaryChildren: true }
				});
			}

			$.append($$anchor, fragment_3);
		},

		$$slots: {
			default: true,
			content: ($$anchor, $$slotProps) => {
				var fragment_4 = root_17();
				var node_17 = $.first_child(fragment_4);

				TabContent(node_17, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Engage content');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var node_18 = $.sibling(node_17, 2);

				TabContent(node_18, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Analyze content');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_4);
			}
		}
	});

	$.append($$anchor, fragment);
}