import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Folder } from 'svelte-tweakpane-ui';
import Shadow from './Shadow.svelte';
import TransactionalBinding from './TransactionalBinding.svelte';
import { haveProperty } from './utils.js';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Light($$anchor, $$props) {
	$.push($$props, true);

	const filterUndefined = (value) => value !== undefined;

	Folder($$anchor, {
		title: 'Light',
		expanded: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			TransactionalBinding(node, {
				get objects() {
					return $$props.lights;
				},
				key: 'color',
				label: 'color',
				options: { color: { type: 'float' } }
			});

			var node_1 = $.sibling(node, 2);

			TransactionalBinding(node_1, {
				get objects() {
					return $$props.lights;
				},
				key: 'intensity',
				label: 'intensity',
				options: { step: 0.01, min: 0 }
			});

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent = ($$anchor) => {
					TransactionalBinding($$anchor, {
						get objects() {
							return $$props.lights;
						},
						key: 'target.position',
						label: 'target'
					});
				};

				var d = $.derived(() => haveProperty($$props.lights, 'isDirectionalLight'));

				var consequent_1 = ($$anchor) => {
					var fragment_3 = root();
					var node_3 = $.first_child(fragment_3);

					TransactionalBinding(node_3, {
						get objects() {
							return $$props.lights;
						},
						key: 'decay',
						label: 'decay'
					});

					var node_4 = $.sibling(node_3, 2);

					TransactionalBinding(node_4, {
						get objects() {
							return $$props.lights;
						},
						key: 'distance',
						label: 'distance'
					});

					var node_5 = $.sibling(node_4, 2);

					TransactionalBinding(node_5, {
						get objects() {
							return $$props.lights;
						},
						key: 'power',
						label: 'power'
					});

					$.append($$anchor, fragment_3);
				};

				var d_1 = $.derived(() => haveProperty($$props.lights, 'isPointLight'));

				var consequent_2 = ($$anchor) => {
					var fragment_4 = root_1();
					var node_6 = $.first_child(fragment_4);

					TransactionalBinding(node_6, {
						get objects() {
							return $$props.lights;
						},
						key: 'target.position',
						label: 'target'
					});

					var node_7 = $.sibling(node_6, 2);

					TransactionalBinding(node_7, {
						get objects() {
							return $$props.lights;
						},
						key: 'angle',
						label: 'angle',
						options: { min: 0, max: Math.PI / 2 }
					});

					var node_8 = $.sibling(node_7, 2);

					TransactionalBinding(node_8, {
						get objects() {
							return $$props.lights;
						},
						key: 'decay',
						label: 'decay'
					});

					var node_9 = $.sibling(node_8, 2);

					TransactionalBinding(node_9, {
						get objects() {
							return $$props.lights;
						},
						key: 'distance',
						label: 'distance'
					});

					var node_10 = $.sibling(node_9, 2);

					TransactionalBinding(node_10, {
						get objects() {
							return $$props.lights;
						},
						key: 'penumbra',
						label: 'penumbra',
						options: { min: 0, max: 1 }
					});

					var node_11 = $.sibling(node_10, 2);

					TransactionalBinding(node_11, {
						get objects() {
							return $$props.lights;
						},
						key: 'power',
						label: 'power'
					});

					$.append($$anchor, fragment_4);
				};

				var d_2 = $.derived(() => haveProperty($$props.lights, 'isSpotLight'));

				var consequent_3 = ($$anchor) => {
					TransactionalBinding($$anchor, {
						get objects() {
							return $$props.lights;
						},
						key: 'groundColor',
						label: 'groundColor'
					});
				};

				var d_3 = $.derived(() => haveProperty($$props.lights, 'isHemisphereLight'));

				var consequent_4 = ($$anchor) => {
					var fragment_6 = root();
					var node_12 = $.first_child(fragment_6);

					TransactionalBinding(node_12, {
						get objects() {
							return $$props.lights;
						},
						key: 'power',
						label: 'power'
					});

					var node_13 = $.sibling(node_12, 2);

					TransactionalBinding(node_13, {
						get objects() {
							return $$props.lights;
						},
						key: 'width',
						label: 'width'
					});

					var node_14 = $.sibling(node_13, 2);

					TransactionalBinding(node_14, {
						get objects() {
							return $$props.lights;
						},
						key: 'height',
						label: 'height'
					});

					$.append($$anchor, fragment_6);
				};

				var d_4 = $.derived(() => haveProperty($$props.lights, 'isRectAreaLight'));

				$.if(node_2, ($$render) => {
					if ($.get(d)) $$render(consequent); else if ($.get(d_1)) $$render(consequent_1, 1); else if ($.get(d_2)) $$render(consequent_2, 2); else if ($.get(d_3)) $$render(consequent_3, 3); else if ($.get(d_4)) $$render(consequent_4, 4);
				});
			}

			var node_15 = $.sibling(node_2, 2);

			{
				var consequent_5 = ($$anchor) => {
					Folder($$anchor, {
						expanded: false,
						title: 'Shadow',
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => $$props.lights.map((light) => light.shadow).filter(filterUndefined));

								Shadow($$anchor, {
									get objects() {
										return $.get($0);
									}
								});
							}
						},
						$$slots: { default: true }
					});
				};

				var d_5 = $.derived(() => haveProperty($$props.lights, 'shadow'));

				$.if(node_15, ($$render) => {
					if ($.get(d_5)) $$render(consequent_5);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}