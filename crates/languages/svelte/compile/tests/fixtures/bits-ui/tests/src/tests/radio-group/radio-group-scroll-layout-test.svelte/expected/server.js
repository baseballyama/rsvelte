import * as $ from 'svelte/internal/server';
import "../../app.css";
import { RadioGroup } from "bits-ui";

export default function Radio_group_scroll_layout_test($$renderer, $$props) {
	let { name } = $$props;
	const rows = Array.from({ length: 120 }, (_, index) => index + 1);
	let value = "one";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div data-testid="shell" style="height: 320px; overflow: hidden;"><div style="display: flex; height: 100%;"><aside data-testid="sidebar" style="width: 120px; flex-shrink: 0; overflow-y: auto; border-right: 1px solid black;"><!--[-->`);

		const each_array = $.ensure_array_like(rows);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let row = each_array[i];

			$$renderer.push(`<div style="height: 24px;">Sidebar row ${$.escape(row)}</div>`);
		}

		$$renderer.push(`<!--]--></aside> <main data-testid="panel" style="min-width: 0; flex: 1; overflow-y: auto; padding: 12px;"><!--[-->`);

		const each_array_1 = $.ensure_array_like(rows);

		for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
			let row = each_array_1[i];

			$$renderer.push(`<div style="height: 24px;">Before row ${$.escape(row)}</div>`);
		}

		$$renderer.push(`<!--]--> `);

		if (RadioGroup.Root) {
			$$renderer.push('<!--[-->');

			RadioGroup.Root($$renderer, {
				name,
				orientation: 'horizontal',
				'data-testid': 'root',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (RadioGroup.Item) {
						$$renderer.push('<!--[-->');

						RadioGroup.Item($$renderer, {
							value: 'one',
							children: ($$renderer) => {
								$$renderer.push(`<!---->One`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (RadioGroup.Item) {
						$$renderer.push('<!--[-->');

						RadioGroup.Item($$renderer, {
							value: 'two',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Two`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` <!--[-->`);

		const each_array_2 = $.ensure_array_like(rows);

		for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
			let row = each_array_2[i];

			$$renderer.push(`<div style="height: 24px;">After row ${$.escape(row)}</div>`);
		}

		$$renderer.push(`<!--]--></main></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}