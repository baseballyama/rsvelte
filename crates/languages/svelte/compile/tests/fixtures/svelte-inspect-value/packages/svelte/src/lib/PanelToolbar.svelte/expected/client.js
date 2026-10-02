import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import NodeIconButton from './components/NodeIconButton.svelte';
import Select from './components/Select.svelte';
import * as icons from './components/icons/index.js';

var root = $.from_html(`<option>left</option> <option>center</option> <option>right</option> <option>full</option>`, 1);
var root_1 = $.from_html(`<option>top</option> <option>middle</option> <option>bottom</option> <option>full</option>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<option>solid</option> <option>dense</option> <option>glassy</option> <option>floating</option>`, 1);
var root_4 = $.from_html(`<div><div class="group svelte-om6l88"><!> <!> <!></div> <div class="group svelte-om6l88"><!> <!></div></div>`);

export default function PanelToolbar($$anchor, $$props) {
	$.push($$props, true);

	let fullScreen = $.prop($$props, 'fullScreen', 15, false),
		appearance = $.prop($$props, 'appearance', 15, 'solid');

	var div = root_4();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	NodeIconButton(node, {
		title: 'Toggle full view',
		onclick: () => fullScreen(!fullScreen()),
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.component(node_2, () => icons.FullscreenExit, ($$anchor, icons_FullscreenExit) => {
						icons_FullscreenExit($$anchor, {});
					});

					$.append($$anchor, fragment_1);
				};

				var alternate = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_3 = $.first_child(fragment_2);

					$.component(node_3, () => icons.Fullscreen, ($$anchor, icons_Fullscreen) => {
						icons_Fullscreen($$anchor, {});
					});

					$.append($$anchor, fragment_2);
				};

				$.if(node_1, ($$render) => {
					if (fullScreen()) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			NodeIconButton($$anchor, {
				title: 'Toggle opacity',
				get onclick() {
					return $$props.toggleOpacity;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_4 = $.comment();
					var node_5 = $.first_child(fragment_4);

					{
						var consequent_1 = ($$anchor) => {
							var fragment_5 = $.comment();
							var node_6 = $.first_child(fragment_5);

							$.component(node_6, () => icons.Opacity, ($$anchor, icons_Opacity) => {
								icons_Opacity($$anchor, {});
							});

							$.append($$anchor, fragment_5);
						};

						var alternate_1 = ($$anchor) => {
							var fragment_6 = $.comment();
							var node_7 = $.first_child(fragment_6);

							$.component(node_7, () => icons.Circle, ($$anchor, icons_Circle) => {
								icons_Circle($$anchor, {});
							});

							$.append($$anchor, fragment_6);
						};

						$.if(node_5, ($$render) => {
							if ($$props.opacity) $$render(consequent_1); else $$render(alternate_1, -1);
						});
					}

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_4, ($$render) => {
			if (!fullScreen()) $$render(consequent_2);
		});
	}

	var node_8 = $.sibling(node_4, 2);

	{
		var consequent_3 = ($$anchor) => {
			NodeIconButton($$anchor, {
				title: 'Reset size',
				get onclick() {
					return $$props.onReset;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_8 = $.comment();
					var node_9 = $.first_child(fragment_8);

					$.component(node_9, () => icons.ResetResize, ($$anchor, icons_ResetResize) => {
						icons_ResetResize($$anchor, {});
					});

					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_8, ($$render) => {
			if ($$props.showResetButton) $$render(consequent_3);
		});
	}

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_10 = $.child(div_2);

	{
		var consequent_4 = ($$anchor) => {
			var fragment_9 = root_2();
			var node_11 = $.first_child(fragment_9);

			Select(node_11, {
				prefix: 'x',
				name: 'x-position',
				title: 'Set x-position',
				get value() {
					return $$props.xPos;
				},
				onchange: (e) => $$props.onAlignChange(e.currentTarget.value, $$props.yPos),
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root();
					var option = $.sibling($.first_child(fragment_10), 2);
					var option_1 = $.sibling(option, 4);

					$.template_effect(
						($0, $1) => {
							option.disabled = $0;
							option_1.disabled = $1;
						},
						[
							() => ['middle', 'full'].includes($$props.yPos),
							() => ['middle', 'full'].includes($$props.yPos)
						]
					);

					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_11, 2);

			Select(node_12, {
				prefix: 'y',
				name: 'y-position',
				title: 'Set y-position',
				get value() {
					return $$props.yPos;
				},
				onchange: (e) => $$props.onAlignChange($$props.xPos, e.currentTarget.value),
				children: ($$anchor, $$slotProps) => {
					var fragment_11 = root_1();
					var option_2 = $.sibling($.first_child(fragment_11), 2);
					var option_3 = $.sibling(option_2, 4);

					$.template_effect(
						($0, $1) => {
							option_2.disabled = $0;
							option_3.disabled = $1;
						},
						[
							() => ['full', 'center'].includes($$props.xPos),
							() => ['center', 'full'].includes($$props.xPos)
						]
					);

					$.append($$anchor, fragment_11);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_9);
		};

		$.if(node_10, ($$render) => {
			if (!fullScreen()) $$render(consequent_4);
		});
	}

	var node_13 = $.sibling(node_10, 2);

	Select(node_13, {
		name: 'appearance',
		onchange: () => $$props.settingsChanged(['appearance']),
		get value() {
			return appearance();
		},

		set value($$value) {
			appearance($$value);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_12 = root_3();

			$.next(6);
			$.append($$anchor, fragment_12);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, $.clsx(['toolbar', $$props.yPos]), 'svelte-om6l88'));
	$.append($$anchor, div);
	$.pop();
}