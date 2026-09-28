import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Paper, { Title, Content } from '@smui/paper';
import Slider from '@smui/slider';
import Radio from '@smui/radio';
import FormField from '@smui/form-field';

var root = $.from_html(`<span style="padding-inline-end: 12px; width: max-content; display: block;">Elevation</span>`);
var root_1 = $.from_html(`<div><!></div> <div><!> <!> <!></div>`, 1);

var root_2 = $.from_html(
	`If you add the <code>transition</code> property, elevation changes will
      animate. <br/><br/> <!>`,
	1
);

var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div class="paper-container"><!></div>`);

export default function _ElevationTransition($$anchor) {
	const binding_group = [];
	let elevation = $.state(1);
	let color = $.state('default');
	var div = root_4();
	var node = $.child(div);

	Paper(node, {
		transition: true,
		get elevation() {
			return $.get(elevation);
		},

		get color() {
			return $.get(color);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = root_3();
			var node_1 = $.first_child(fragment);

			Title(node_1, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Elevated Paper');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Content(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_1 = root_2();
					var node_3 = $.sibling($.first_child(fragment_1), 6);

					Paper(node_3, {
						elevation: 0,
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var div_1 = $.first_child(fragment_2);
							var node_4 = $.child(div_1);

							{
								const label = ($$anchor) => {
									var span = root();

									$.append($$anchor, span);
								};

								FormField(node_4, {
									align: 'end',
									style: 'display: flex;',
									label,
									children: ($$anchor, $$slotProps) => {
										Slider($$anchor, {
											style: 'flex-grow: 1;',
											min: 0,
											max: 24,
											discrete: true,
											get value() {
												return $.get(elevation);
											},

											set value($$value) {
												$.set(elevation, $$value, true);
											}
										});
									},
									$$slots: { label: true, default: true }
								});
							}

							$.reset(div_1);

							var div_2 = $.sibling(div_1, 2);
							var node_5 = $.child(div_2);

							{
								const label = ($$anchor) => {
									$.next();

									var text_1 = $.text('Default');

									$.append($$anchor, text_1);
								};

								FormField(node_5, {
									label,
									children: ($$anchor, $$slotProps) => {
										Radio($$anchor, {
											value: 'default',
											get group() {
												return $.get(color);
											},

											set group($$value) {
												$.set(color, $$value, true);
											}
										});
									},
									$$slots: { label: true, default: true }
								});
							}

							var node_6 = $.sibling(node_5, 2);

							{
								const label = ($$anchor) => {
									$.next();

									var text_2 = $.text('Primary');

									$.append($$anchor, text_2);
								};

								FormField(node_6, {
									label,
									children: ($$anchor, $$slotProps) => {
										Radio($$anchor, {
											value: 'primary',
											get group() {
												return $.get(color);
											},

											set group($$value) {
												$.set(color, $$value, true);
											}
										});
									},
									$$slots: { label: true, default: true }
								});
							}

							var node_7 = $.sibling(node_6, 2);

							{
								const label = ($$anchor) => {
									$.next();

									var text_3 = $.text('Secondary');

									$.append($$anchor, text_3);
								};

								FormField(node_7, {
									label,
									children: ($$anchor, $$slotProps) => {
										Radio($$anchor, {
											value: 'secondary',
											get group() {
												return $.get(color);
											},

											set group($$value) {
												$.set(color, $$value, true);
											}
										});
									},
									$$slots: { label: true, default: true }
								});
							}

							$.reset(div_2);
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}