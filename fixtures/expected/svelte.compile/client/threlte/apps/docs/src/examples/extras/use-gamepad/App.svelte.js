import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { Pane, Folder, Slider, ButtonGrid } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="svelte-h62pab"><!></div>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	let gamepadRef = $.state(void 0);

	const buttonNames = [
		'clusterBottom',
		'clusterRight',
		'clusterLeft',
		'clusterTop',
		'leftBumper',
		'rightBumper',
		'select',
		'start',
		'leftStickButton',
		'rightStickButton',
		'directionalTop',
		'directionalBottom',
		'directionalLeft',
		'directionalRight',
		'center'
	];

	const stickNames = ['leftStick', 'rightStick'];

	const buttonLabels = $.derived(() => $.get(gamepadRef)
		? buttonNames.map((name) => $.get(gamepadRef)?.button(name).pressed ? `▶ ${name}` : name)
		: buttonNames.map((name) => name));

	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: '',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			ButtonGrid(node_1, {
				get buttons() {
					return $.get(buttonLabels);
				},
				columns: 2,
				disabled: true
			});

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					Folder(node_3, {
						title: 'Triggers',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_4 = $.first_child(fragment_3);

							{
								let $0 = $.derived(() => $.get(gamepadRef).button('leftTrigger').value);

								Slider(node_4, {
									get value() {
										return $.get($0);
									},
									label: 'LT',
									min: 0,
									max: 1,
									disabled: true
								});
							}

							var node_5 = $.sibling(node_4, 2);

							{
								let $0 = $.derived(() => $.get(gamepadRef).button('rightTrigger').value);

								Slider(node_5, {
									get value() {
										return $.get($0);
									},
									label: 'RT',
									min: 0,
									max: 1,
									disabled: true
								});
							}

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_3, 2);

					Folder(node_6, {
						title: 'Sticks',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_7 = $.first_child(fragment_4);

							$.each(node_7, 17, () => stickNames, $.index, ($$anchor, name) => {
								var fragment_5 = root();
								var node_8 = $.first_child(fragment_5);

								{
									let $0 = $.derived(() => $.get(gamepadRef).stick($.get(name)).x);

									Slider(node_8, {
										get value() {
											return $.get($0);
										},

										get label() {
											return `${$.get(name) ?? ''}X`;
										},
										min: -1,
										max: 1,
										disabled: true
									});
								}

								var node_9 = $.sibling(node_8, 2);

								{
									let $0 = $.derived(() => $.get(gamepadRef).stick($.get(name)).y);

									Slider(node_9, {
										get value() {
											return $.get($0);
										},

										get label() {
											return `${$.get(name) ?? ''}Y`;
										},
										min: -1,
										max: 1,
										disabled: true
									});
								}

								$.append($$anchor, fragment_5);
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				};

				$.if(node_2, ($$render) => {
					if ($.get(gamepadRef)) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_10 = $.child(div);

	Canvas(node_10, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {
				get gamepadRef() {
					return $.get(gamepadRef);
				},

				set gamepadRef($$value) {
					$.set(gamepadRef, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}