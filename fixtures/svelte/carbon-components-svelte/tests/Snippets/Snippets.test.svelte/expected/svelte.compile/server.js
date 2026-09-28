import * as $ from 'svelte/internal/server';
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

export default function Snippets_test($$renderer) {
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

	{
		function expandIcon($$renderer, { expanded, row, props }) {
			$$renderer.push(`<span${$.attributes({
				'data-testid': 'datatable-expand-icon-snippet',
				...props,
				'data-expanded': expanded
			})}></span>`);
		}

		function expandedRow($$renderer, { row, rowSelected: _rowSelected }) {
			$$renderer.push(`<pre>${$.escape(JSON.stringify(row, null, 2))}</pre>`);
		}

		DataTable($$renderer, {
			'data-testid': 'datatable-expand-icon-snippet-container',
			expandable: true,
			headers: dataTableHeaders,
			rows: dataTableRows,
			expandIcon,
			expandedRow,
			$$slots: { expandIcon: true, expandedRow: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function children($$renderer, { item, index, selected, highlighted }) {
			$$renderer.push(`<span${$.attr('data-testid', `dropdown-item-${$.stringify(index)}`)}${$.attr('data-selected', selected)}${$.attr('data-highlighted', highlighted)}>${$.escape(item.text)}
      (#${$.escape(index)})</span>`);
		}

		Dropdown($$renderer, {
			'data-testid': 'dropdown-snippet',
			items,
			selectedId: '1',
			children,
			$$slots: { default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function labelChildren($$renderer) {
			$$renderer.push(`<span data-testid="dropdown-custom-label">Custom label content</span>`);
		}

		Dropdown($$renderer, {
			'data-testid': 'dropdown-label-children',
			items,
			selectedId: '1',
			labelChildren,
			$$slots: { labelChildren: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function labelChildren($$renderer) {
			$$renderer.push(`<span data-testid="icon-indicator-custom-label">Custom label content</span>`);
		}

		IconIndicator($$renderer, {
			'data-testid': 'icon-indicator-label-children',
			kind: 'succeeded',
			label: 'Succeeded',
			labelChildren,
			$$slots: { labelChildren: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function labelChildren($$renderer) {
			$$renderer.push(`<span data-testid="shape-indicator-custom-label">Custom label content</span>`);
		}

		ShapeIndicator($$renderer, {
			'data-testid': 'shape-indicator-label-children',
			kind: 'stable',
			label: 'Stable',
			labelChildren,
			$$slots: { labelChildren: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function icon($$renderer, { item }) {
			$$renderer.push(`<span${$.attr('data-testid', `dropdown-icon-${$.stringify(item.id)}`)}>L</span>`);
		}

		function iconRight($$renderer, { item, selected }) {
			$$renderer.push(`<span${$.attr('data-testid', `dropdown-icon-right-${$.stringify(item.id)}`)}${$.attr('data-selected', selected)}>R</span>`);
		}

		Dropdown($$renderer, {
			'data-testid': 'dropdown-icon-snippets',
			items,
			selectedId: '1',
			icon,
			iconRight,
			$$slots: { icon: true, iconRight: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function children($$renderer, { item, index, selected }) {
			$$renderer.push(`<span${$.attr('data-testid', `combobox-item-${$.stringify(index)}`)}${$.attr('data-selected', selected)}>${$.escape(item.text)}
      - index ${$.escape(index)}</span>`);
		}

		ComboBox($$renderer, {
			'data-testid': 'combobox-snippet',
			items,
			selectedId: '2',
			children,
			$$slots: { default: true }
		});
	}

	$$renderer.push(`<!----> `);

	OverflowMenu($$renderer, {
		'data-testid': 'overflow-menu-snippet',
		open: true,
		children: ($$renderer) => {
			{
				function icon($$renderer) {
					$$renderer.push(`<span data-testid="overflow-item-icon-left">L</span>`);
				}

				function iconRight($$renderer) {
					$$renderer.push(`<span data-testid="overflow-item-icon-right">R</span>`);
				}

				OverflowMenuItem($$renderer, {
					text: 'Edit',
					icon,
					iconRight,
					$$slots: { icon: true, iconRight: true }
				});
			}
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		'data-testid': 'button-snippet',
		as: true,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { props }) => {
				$$renderer.push(`<div${$.attributes({ ...props, 'data-testid': 'custom-button' })}>Custom Button Element</div>`);
			}
		}
	});

	$$renderer.push(`<!----> <div data-testid="theme-snippet">`);

	{
		function children($$renderer, { theme }) {
			$$renderer.push(`<div data-testid="theme-value">Current theme: ${$.escape(theme)}</div>`);
		}

		Theme($$renderer, { children, $$slots: { default: true } });
	}

	$$renderer.push(`<!----></div> `);

	ProgressIndicator($$renderer, {
		'data-testid': 'progress-step-icon-snippet',
		currentIndex: 1,
		children: ($$renderer) => {
			{
				function icon($$renderer, { complete, current, invalid }) {
					$$renderer.push(`<span data-testid="progress-step-icon-1"${$.attr('data-complete', complete)}${$.attr('data-current', current)}${$.attr('data-invalid', invalid)}>1</span>`);
				}

				ProgressStep($$renderer, {
					complete: true,
					label: 'Step 1',
					description: 'Completed',
					icon,
					$$slots: { icon: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function icon($$renderer, { complete, current, invalid }) {
					$$renderer.push(`<span data-testid="progress-step-icon-2"${$.attr('data-complete', complete)}${$.attr('data-current', current)}${$.attr('data-invalid', invalid)}>2</span>`);
				}

				ProgressStep($$renderer, {
					label: 'Step 2',
					description: 'Current',
					icon,
					$$slots: { icon: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function icon($$renderer, { complete, current, invalid }) {
					$$renderer.push(`<span data-testid="progress-step-icon-3"${$.attr('data-complete', complete)}${$.attr('data-current', current)}${$.attr('data-invalid', invalid)}>3</span>`);
				}

				ProgressStep($$renderer, {
					invalid: true,
					label: 'Step 3',
					description: 'Invalid',
					icon,
					$$slots: { icon: true }
				});
			}

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Tabs($$renderer, {
		type: 'container',
		'data-testid': 'tabs-secondary-label-snippet',
		'aria-label': 'Secondary label tabs',
		children: ($$renderer) => {
			Tab($$renderer, { label: 'Engage', secondaryLabel: '(21/25)' });
			$$renderer.push(`<!----> `);

			{
				function secondaryChildren($$renderer) {
					$$renderer.push(`<span data-testid="tab-secondary-label-snippet">(12/16)</span>`);
				}

				Tab($$renderer, {
					label: 'Analyze',
					secondaryChildren,
					$$slots: { secondaryChildren: true }
				});
			}

			$$renderer.push(`<!---->`);
		},

		$$slots: {
			default: true,
			content: ($$renderer) => {
				{
					TabContent($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Engage content`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TabContent($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Analyze content`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				}
			}
		}
	});

	$$renderer.push(`<!---->`);
}