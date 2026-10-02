import 'svelte/internal/disclose-version';
import { getOlympians } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Chart, Circle, Dodge, Text } from 'layerchart';

const olympians = await getOlympians();
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><!></div>`);
var root_2 = $.from_html(`<div class="grid grid-cols-1 gap-4"></div>`);

export default function Anchor($$anchor, $$props) {
	$.push($$props, true);

	const data = olympians.filter((d) => d.weight != null).slice(0, 200);
	const anchors = ['top', 'middle', 'bottom'];
	var $$exports = { data };
	var div = root_2();

	$.each(div, 20, () => anchors, (anchor) => anchor, ($$anchor, anchor) => {
		var div_1 = root_1();
		var node = $.child(div_1);

		{
			const marks = ($$anchor, $$arg0) => {
				let context = () => ($$arg0?.()).context;
				var fragment = root();
				var node_1 = $.first_child(fragment);

				Text(node_1, {
					x: 8,
					y: 8,
					get value() {
						return `anchor: ${anchor ?? ''}`;
					},
					textAnchor: 'start',
					verticalAnchor: 'start',
					class: 'text-[10px] fill-surface-content/60'
				});

				var node_2 = $.sibling(node_1, 2);

				{
					const children = ($$anchor, $$arg0) => {
						let dodged = () => ($$arg0?.()).items;
						var fragment_1 = $.comment();
						var node_3 = $.first_child(fragment_1);

						$.each(node_3, 17, dodged, ({ x, y, r, index }) => index, ($$anchor, $$item) => {
							let x = () => $.get($$item).x;
							let y = () => $.get($$item).y;
							let r = () => $.get($$item).r;
							let index = () => $.get($$item).index;

							Circle($$anchor, {
								get cx() {
									return x();
								},

								get cy() {
									return y();
								},

								get r() {
									return r();
								},
								class: 'fill-info opacity-70',
								onpointermove: (e) => context().tooltip.show(e, data[index()]),
								get onpointerleave() {
									return context().tooltip.hide;
								}
							});
						});

						$.append($$anchor, fragment_1);
					};

					Dodge(node_2, {
						axis: 'y',
						get anchor() {
							return anchor;
						},
						r: 3,
						padding: 1,
						children,
						$$slots: { default: true }
					});
				}

				$.append($$anchor, fragment);
			};

			Chart(node, {
				get data() {
					return data;
				},
				x: 'weight',
				xNice: true,
				padding: { top: 24, bottom: 24, left: 12, right: 12 },
				height: 160,
				axis: 'x',
				marks,
				$$slots: { marks: true }
			});
		}

		$.reset(div_1);
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);

	return $.pop($$exports);
}