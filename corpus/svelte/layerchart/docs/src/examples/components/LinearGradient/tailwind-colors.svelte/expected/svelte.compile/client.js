import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Layer, LinearGradient, Rect } from 'layerchart';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="overflow-x-auto max-w-full"><!></div>`);

export default function Tailwind_colors($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Chart(node, {
		height: 320,
		width: 1065,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;

							Rect($$anchor, {
								x: 120 * 0,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								get fill() {
									return gradient();
								}
							});
						};

						LinearGradient(node_1, {
							class: 'from-pink-500 to-yellow-500',
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}

					var node_2 = $.sibling(node_1, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;

							Rect($$anchor, {
								x: 120 * 1,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								get fill() {
									return gradient();
								}
							});
						};

						LinearGradient(node_2, {
							class: 'from-green-300 to-purple-600',
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}

					var node_3 = $.sibling(node_2, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;

							Rect($$anchor, {
								x: 120 * 2,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								get fill() {
									return gradient();
								}
							});
						};

						LinearGradient(node_3, {
							class: 'from-gray-600 to-black',
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}

					var node_4 = $.sibling(node_3, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;

							Rect($$anchor, {
								x: 120 * 3,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								get fill() {
									return gradient();
								}
							});
						};

						LinearGradient(node_4, {
							class: 'from-pink-300 to-indigo-400',
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}

					var node_5 = $.sibling(node_4, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;

							Rect($$anchor, {
								x: 120 * 4,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								get fill() {
									return gradient();
								}
							});
						};

						LinearGradient(node_5, {
							class: 'from-yellow-100 to-yellow-500',
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}

					var node_6 = $.sibling(node_5, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;

							Rect($$anchor, {
								x: 120 * 5,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								get fill() {
									return gradient();
								}
							});
						};

						LinearGradient(node_6, {
							class: 'from-blue-700 to-gray-900',
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}

					var node_7 = $.sibling(node_6, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;

							Rect($$anchor, {
								x: 120 * 6,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								get fill() {
									return gradient();
								}
							});
						};

						LinearGradient(node_7, {
							class: 'from-sky-300 to-blue-500',
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}

					var node_8 = $.sibling(node_7, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;

							Rect($$anchor, {
								x: 120 * 7,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								get fill() {
									return gradient();
								}
							});
						};

						LinearGradient(node_8, {
							class: 'from-red-500 to-red-800',
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}

					var node_9 = $.sibling(node_8, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;

							Rect($$anchor, {
								x: 120 * 8,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								get fill() {
									return gradient();
								}
							});
						};

						LinearGradient(node_9, {
							class: 'from-blue-400 to-emerald-400',
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}