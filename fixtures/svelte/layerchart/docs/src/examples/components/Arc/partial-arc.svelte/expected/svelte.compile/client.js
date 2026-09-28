import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Arc, Chart, Group, Layer, LinearGradient, Text } from 'layerchart';
import ArcControls from '$lib/components/controls/ArcControls.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Partial_arc($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state(75);

	var $$exports = {
		get data() {
			return $.get(value);
		},

		set data($$value) {
			$.set(value, $.proxy($$value));
		}
	};

	var fragment = root();
	var node = $.first_child(fragment);

	ArcControls(node, {
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Chart(node_1, {
		height: 120,
		padding: 20,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				center: true,
				children: ($$anchor, $$slotProps) => {
					Group($$anchor, {
						y: 16,
						children: ($$anchor, $$slotProps) => {
							{
								const children = ($$anchor, $$arg0) => {
									let gradient = () => ($$arg0?.()).gradient;

									{
										const children = ($$anchor, $$arg0) => {
											let value = () => ($$arg0?.()).value;

											{
												let $0 = $.derived(() => Math.round(value()) + '%');

												Text($$anchor, {
													get value() {
														return $.get($0);
													},
													textAnchor: 'middle',
													verticalAnchor: 'middle',
													class: 'text-3xl tabular-nums'
												});
											}
										};

										Arc($$anchor, {
											get value() {
												return $.get(value);
											},
											range: [-120, 120],
											outerRadius: 60,
											innerRadius: 50,
											cornerRadius: 5,
											motion: 'spring',
											get fill() {
												return gradient();
											},
											track: { class: 'fill-none stroke-surface-content/10' },
											children,
											$$slots: { default: true }
										});
									}
								};

								LinearGradient($$anchor, {
									class: 'from-secondary to-primary',
									children,
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}