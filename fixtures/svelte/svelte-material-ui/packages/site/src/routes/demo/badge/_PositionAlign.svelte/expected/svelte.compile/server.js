import * as $ from 'svelte/internal/server';
import Badge from '@smui-extra/badge';
import Button, { Label } from '@smui/button';
import Radio from '@smui/radio';
import FormField from '@smui/form-field';

export default function _PositionAlign($$renderer) {
	let position = 'middle';
	let alignY = 'top';
	let alignX = 'end';
	const align = $.derived(() => `${alignY}-${alignX}`);
	const positions = ['inset', 'middle', 'outset'];
	const alignmentsY = ['top', 'middle', 'bottom'];
	const alignmentsX = ['start', 'middle', 'end'];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div style="margin-top: 2em; text-align: center;">`);

		Button($$renderer, {
			style: 'position: relative;',
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Button`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Badge($$renderer, {
					position,
					align: align(),
					'aria-label': 'unread count',
					children: ($$renderer) => {
						$$renderer.push(`<!---->8`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div style="margin-top: 2em;">Position: <!--[-->`);

		const each_array = $.ensure_array_like(positions);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let pos = each_array[$$index];

			{
				function label($$renderer) {
					$$renderer.push(`<!---->${$.escape(pos)}`);
				}

				FormField($$renderer, {
					label,
					children: ($$renderer) => {
						Radio($$renderer, {
							value: pos,
							get group() {
								return position;
							},

							set group($$value) {
								position = $$value;
								$$settled = false;
							}
						});
					},
					$$slots: { label: true, default: true }
				});
			}
		}

		$$renderer.push(`<!--]--></div> <div style="margin-top: 2em;">Y Alignment: <!--[-->`);

		const each_array_1 = $.ensure_array_like(alignmentsY);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let alignment = each_array_1[$$index_1];

			{
				function label($$renderer) {
					$$renderer.push(`<!---->${$.escape(alignment)}`);
				}

				FormField($$renderer, {
					label,
					children: ($$renderer) => {
						Radio($$renderer, {
							value: alignment,
							get group() {
								return alignY;
							},

							set group($$value) {
								alignY = $$value;
								$$settled = false;
							}
						});
					},
					$$slots: { label: true, default: true }
				});
			}
		}

		$$renderer.push(`<!--]--></div> <div style="margin-top: 2em;">X Alignment: <!--[-->`);

		const each_array_2 = $.ensure_array_like(alignmentsX);

		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let alignment = each_array_2[$$index_2];

			{
				function label($$renderer) {
					$$renderer.push(`<!---->${$.escape(alignment)}`);
				}

				FormField($$renderer, {
					label,
					children: ($$renderer) => {
						Radio($$renderer, {
							value: alignment,
							get group() {
								return alignX;
							},

							set group($$value) {
								alignX = $$value;
								$$settled = false;
							}
						});
					},
					$$slots: { label: true, default: true }
				});
			}
		}

		$$renderer.push(`<!--]--></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}