import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AutoValue, ButtonGrid, Checkbox, Pane, Separator, Slider } from '$lib';
import Button from '$lib/control/Button.svelte';
import Folder from '$lib/core/Folder.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function TestOrder($$anchor) {
	const testObject = {
		someColor: { r: 255, g: 0, b: 55 },
		someOtherColor: { r: 0, g: 255, b: 55 }
	};

	let showNumbers = true;
	let folderWrap = false;
	let someNumber = 1;

	Pane($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Folder(node_1, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_2 = $.first_child(fragment_3);

							$.each(node_2, 17, () => Object.keys(testObject), $.index, ($$anchor, key) => {
								var fragment_4 = $.comment();
								var node_3 = $.first_child(fragment_4);

								{
									var consequent = ($$anchor) => {
										AutoValue($$anchor, {
											get label() {
												return $.get(key);
											},

											get value() {
												return testObject[$.get(key)];
											},

											set value($$value) {
												testObject[$.get(key)] = $$value;
											}
										});
									};

									$.if(node_3, ($$render) => {
										if (typeof testObject[$.get(key)] !== 'number' || showNumbers) $$render(consequent);
									});
								}

								$.append($$anchor, fragment_4);
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_1, 2);

					Slider(node_4, {
						label: 'Some Number',
						get value() {
							return someNumber;
						},

						set value($$value) {
							someNumber = $$value;
						}
					});

					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var fragment_6 = root();
					var node_5 = $.first_child(fragment_6);

					$.each(node_5, 17, () => Object.keys(testObject), $.index, ($$anchor, key) => {
						var fragment_7 = $.comment();
						var node_6 = $.first_child(fragment_7);

						{
							var consequent_2 = ($$anchor) => {
								AutoValue($$anchor, {
									get label() {
										return $.get(key);
									},

									get value() {
										return testObject[$.get(key)];
									},

									set value($$value) {
										testObject[$.get(key)] = $$value;
									}
								});
							};

							$.if(node_6, ($$render) => {
								if (typeof testObject[$.get(key)] !== 'number' || showNumbers) $$render(consequent_2);
							});
						}

						$.append($$anchor, fragment_7);
					});

					var node_7 = $.sibling(node_5, 2);

					Slider(node_7, {
						label: 'Some Number',
						get value() {
							return someNumber;
						},

						set value($$value) {
							someNumber = $$value;
						}
					});

					$.append($$anchor, fragment_6);
				};

				$.if(node, ($$render) => {
					if (folderWrap) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			var node_8 = $.sibling(node, 2);

			Separator(node_8, {});

			var node_9 = $.sibling(node_8, 2);

			ButtonGrid(node_9, { buttons: ['Copy', 'Reset'] });

			var node_10 = $.sibling(node_9, 2);

			Folder(node_10, {
				expanded: false,
				title: 'Tweakpane CSS Options',
				children: ($$anchor, $$slotProps) => {
					var fragment_9 = root();
					var node_11 = $.first_child(fragment_9);

					Checkbox(node_11, {
						label: 'Show Numbers',
						get value() {
							return showNumbers;
						},

						set value($$value) {
							showNumbers = $$value;
						}
					});

					var node_12 = $.sibling(node_11, 2);

					Checkbox(node_12, {
						label: 'Folder Wrap',
						get value() {
							return folderWrap;
						},

						set value($$value) {
							folderWrap = $$value;
						}
					});

					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});

			var node_13 = $.sibling(node_10, 2);

			Button(node_13, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}