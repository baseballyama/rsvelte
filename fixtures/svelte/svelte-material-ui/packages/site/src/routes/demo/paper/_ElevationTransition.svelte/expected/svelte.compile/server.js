import * as $ from 'svelte/internal/server';
import Paper, { Title, Content } from '@smui/paper';
import Slider from '@smui/slider';
import Radio from '@smui/radio';
import FormField from '@smui/form-field';

export default function _ElevationTransition($$renderer) {
	let elevation = 1;
	let color = 'default';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="paper-container">`);

		Paper($$renderer, {
			transition: true,
			elevation,
			color,
			children: ($$renderer) => {
				Title($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Elevated Paper`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Content($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->If you add the <code>transition</code> property, elevation changes will
      animate. <br/><br/> `);

						Paper($$renderer, {
							elevation: 0,
							children: ($$renderer) => {
								$$renderer.push(`<div>`);

								{
									function label($$renderer) {
										$$renderer.push(`<span style="padding-inline-end: 12px; width: max-content; display: block;">Elevation</span>`);
									}

									FormField($$renderer, {
										align: 'end',
										style: 'display: flex;',
										label,
										children: ($$renderer) => {
											Slider($$renderer, {
												style: 'flex-grow: 1;',
												min: 0,
												max: 24,
												discrete: true,
												get value() {
													return elevation;
												},

												set value($$value) {
													elevation = $$value;
													$$settled = false;
												}
											});
										},
										$$slots: { label: true, default: true }
									});
								}

								$$renderer.push(`<!----></div> <div>`);

								{
									function label($$renderer) {
										$$renderer.push(`<!---->Default`);
									}

									FormField($$renderer, {
										label,
										children: ($$renderer) => {
											Radio($$renderer, {
												value: 'default',
												get group() {
													return color;
												},

												set group($$value) {
													color = $$value;
													$$settled = false;
												}
											});
										},
										$$slots: { label: true, default: true }
									});
								}

								$$renderer.push(`<!----> `);

								{
									function label($$renderer) {
										$$renderer.push(`<!---->Primary`);
									}

									FormField($$renderer, {
										label,
										children: ($$renderer) => {
											Radio($$renderer, {
												value: 'primary',
												get group() {
													return color;
												},

												set group($$value) {
													color = $$value;
													$$settled = false;
												}
											});
										},
										$$slots: { label: true, default: true }
									});
								}

								$$renderer.push(`<!----> `);

								{
									function label($$renderer) {
										$$renderer.push(`<!---->Secondary`);
									}

									FormField($$renderer, {
										label,
										children: ($$renderer) => {
											Radio($$renderer, {
												value: 'secondary',
												get group() {
													return color;
												},

												set group($$value) {
													color = $$value;
													$$settled = false;
												}
											});
										},
										$$slots: { label: true, default: true }
									});
								}

								$$renderer.push(`<!----></div>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}