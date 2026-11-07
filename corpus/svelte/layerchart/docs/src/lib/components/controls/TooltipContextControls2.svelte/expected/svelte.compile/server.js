import * as $ from 'svelte/internal/server';
import { Button, Field, Menu, MenuField, Switch, Toggle } from 'svelte-ux';
import { Tooltip } from 'layerchart';

export default function TooltipContextControls2($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const anchorOptions = [
			'top-left',
			'top',
			'top-right',
			'left',
			'center',
			'right',
			'bottom-left',
			'bottom',
			'bottom-right'
		];

		let {
			anchor = 'top-left',
			snap = 'pointer',
			contained = false,
			portal = true
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-cols-3 gap-2 mb-4 screenshot-hidden">`);

			Toggle($$renderer, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { on: open, toggle }) => {
						Field($$renderer, {
							label: 'Anchor',
							class: 'cursor-pointer',
							children: ($$renderer) => {
								$$renderer.push(`<span class="text-sm">${$.escape(anchor)}</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Menu($$renderer, {
							open,
							placement: 'bottom-start',
							children: ($$renderer) => {
								$$renderer.push(`<div class="grid grid-cols-3 gap-1 p-1"><!--[-->`);

								const each_array = $.ensure_array_like(anchorOptions);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let option = each_array[$$index];

									Button($$renderer, {
										variant: 'outline',
										color: option === anchor ? 'primary' : 'default',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(option)}`);
										},
										$$slots: { default: true }
									});
								}

								$$renderer.push(`<!--]--></div>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					}
				}
			});

			$$renderer.push(`<!----> `);

			MenuField($$renderer, {
				label: 'Snap',
				options: [
					{ label: 'pointer', value: 'pointer' },
					{ label: 'data', value: 'data' }
				],

				get value() {
					return snap;
				},

				set value($$value) {
					snap = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="flex gap-2">`);

			MenuField($$renderer, {
				label: 'Contained',
				options: [
					{ label: 'none', value: false },
					{ label: 'container', value: 'container' },
					{ label: 'window', value: 'window' }
				],
				class: 'flex-1',
				get value() {
					return contained;
				},

				set value($$value) {
					contained = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Portal',
				children: ($$renderer) => {
					Switch($$renderer, {
						get checked() {
							return portal;
						},

						set checked($$value) {
							portal = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { anchor, snap, contained, portal });
	});
}