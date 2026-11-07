import * as $ from 'svelte/internal/server';
import ToggleButton from './ToggleButton.svelte';

export default function GlobalOptions($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { options = void 0, onreset = () => {} } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="options svelte-1s540ba"><div class="options-title svelte-1s540ba">global options (<a href="/docs/types/InspectOptions" style="text-decoration: none;">docs</a>)</div> <button class="reset-button svelte-1s540ba">reset</button> <label style="flex-basis: 100%; margin-top: 1ch" class="svelte-1s540ba">theme `);

			$$renderer.select(
				{
					value: options.theme,
					name: 'theme',
					style: 'width: 100%',
					class: ''
				},
				($$renderer) => {
					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`inspect`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`drak`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`stereo`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`dark`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`light`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`plain`);
					});
				},
				'svelte-1s540ba'
			);

			$$renderer.push(`</label> `);

			ToggleButton($$renderer, {
				get checked() {
					return options.showLength;
				},

				set checked($$value) {
					options.showLength = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<!---->lengths`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ToggleButton($$renderer, {
				get checked() {
					return options.showTypes;
				},

				set checked($$value) {
					options.showTypes = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<!---->types`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ToggleButton($$renderer, {
				get checked() {
					return options.showTools;
				},

				set checked($$value) {
					options.showTools = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<!---->tools`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ToggleButton($$renderer, {
				get checked() {
					return options.showPreview;
				},

				set checked($$value) {
					options.showPreview = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<!---->previews`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ToggleButton($$renderer, {
				get checked() {
					return options.noanimate;
				},

				set checked($$value) {
					options.noanimate = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<!---->noanimate`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ToggleButton($$renderer, {
				get checked() {
					return options.heading;
				},

				set checked($$value) {
					options.heading = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<!---->heading`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ToggleButton($$renderer, {
				get checked() {
					return options.borderless;
				},

				set checked($$value) {
					options.borderless = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<!---->borderless`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ToggleButton($$renderer, {
				get checked() {
					return options.flashOnUpdate;
				},

				set checked($$value) {
					options.flashOnUpdate = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<!---->flash on update`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ToggleButton($$renderer, {
				get checked() {
					return options.embedMedia;
				},

				set checked($$value) {
					options.embedMedia = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<!---->embed media`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ToggleButton($$renderer, {
				get checked() {
					return options.parseJson;
				},

				set checked($$value) {
					options.parseJson = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<!---->parse json`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <label title="animation rate" class="svelte-1s540ba">anim rate <input type="number"${$.attr('value', options.animRate)} min="0.1" max="10"${$.attr('step', 0.1)} style="width: 5em" name="animation-rate" class="svelte-1s540ba"/></label> <label class="svelte-1s540ba">store `);

			$$renderer.select(
				{ value: options.stores, name: 'stores', class: '' },
				($$renderer) => {
					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`full`);
					});

					$$renderer.option({ value: 'value-only' }, ($$renderer) => {
						$$renderer.push(`value only`);
					});

					$$renderer.option({ value: false }, ($$renderer) => {
						$$renderer.push(`off`);
					});
				},
				'svelte-1s540ba'
			);

			$$renderer.push(`</label> <label class="svelte-1s540ba">elementview `);

			$$renderer.select(
				{ value: options.elementView, name: 'element-view', class: '' },
				($$renderer) => {
					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`simple`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`full`);
					});
				},
				'svelte-1s540ba'
			);

			$$renderer.push(`</label> <label class="svelte-1s540ba">quotes `);

			$$renderer.select(
				{ value: options.quotes, name: 'quotes', class: '' },
				($$renderer) => {
					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`single`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`double`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`none`);
					});
				},
				'svelte-1s540ba'
			);

			$$renderer.push(`</label> <label class="svelte-1s540ba">collapse strings <input type="number"${$.attr('value', options.stringCollapse)} min="0" style="width: 5em" name="collapse-strings" class="svelte-1s540ba"/></label> <label class="svelte-1s540ba">preview depth <input type="number"${$.attr('value', options.previewDepth)} min="0" style="width: 5em" name="preview-depth" class="svelte-1s540ba"/></label> <label class="svelte-1s540ba">preview entries <input type="number"${$.attr('value', options.previewEntries)} min="0" style="width: 5em" name="preview-entries" class="svelte-1s540ba"/></label> <label class="svelte-1s540ba">search `);

			$$renderer.select(
				{ value: options.search, name: 'search', class: '' },
				($$renderer) => {
					$$renderer.option({ value: false }, ($$renderer) => {
						$$renderer.push(`off`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`highlight`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`filter`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`filter-strict`);
					});
				},
				'svelte-1s540ba'
			);

			$$renderer.push(`</label> `);

			if (options.search) {
				$$renderer.push('<!--[0-->');

				ToggleButton($$renderer, {
					get checked() {
						return options.highlightMatches;
					},

					set checked($$value) {
						options.highlightMatches = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->highlight`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { options });
	});
}