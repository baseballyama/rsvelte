import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Fa } from "$lib/index.js";
import { faFlag, faHome, faCog, faSeedling } from "@fortawesome/free-solid-svg-icons";

var root = $.from_html(`<button type="button"> </button>`);
var root_1 = $.from_html(`<div class="col text-center hue svelte-8eaich"><!></div>`);
var root_2 = $.from_html(`<div class="p-5 bg-body-tertiary rounded"><div class="row"><div class="col-md"><h1 class="hue svelte-8eaich"><strong><a href="https://github.com/Cweili/svelte-fa" target="_blank">svelte-fa</a></strong></h1> <p><a href="https://www.npmjs.com/package/svelte-fa" target="_blank"><img src="https://img.shields.io/npm/v/svelte-fa.svg" alt="npm version"/></a> <a href="https://bundlephobia.com/result?p=svelte-fa" target="_blank"><img src="https://img.shields.io/bundlephobia/minzip/svelte-fa.svg" alt="bundle size"/></a> <a href="https://github.com/Cweili/svelte-fa/blob/master/LICENSE" target="_blank"><img src="https://img.shields.io/npm/l/svelte-fa.svg" alt="MIT licence"/></a> <a href="https://www.npmjs.com/package/svelte-fa" target="_blank"><img src="https://img.shields.io/npm/dt/svelte-fa.svg" alt="npm downloads"/></a> <a href="https://github.com/Cweili/svelte-fa" target="_blank"><img src="https://img.shields.io/github/issues/Cweili/svelte-fa.svg" alt="github issues"/></a></p> <p class="lead mb-5">Tiny <a class="hue svelte-8eaich" href="https://fontawesome.com/" target="_blank">FontAwesome</a> component for <a class="hue svelte-8eaich" href="https://svelte.dev/" target="_blank">Svelte</a>.</p> <form><div class="row mb-3"><label for="iconSizeInput" class="col-sm-3 col-form-label">Icon Sizes</label> <div class="col-sm-9 row"><div class="col-md-8 py-2"><input type="range" class="form-control-range" id="iconSizeInput" min="1" max="10" step="0.1"/></div> <div class="col-md-4"><div class="form-control text-center"> </div></div></div></div> <div class="row mb-3"><span class="col-sm-3 col-form-label">Pulled Icons</span> <div class="col-sm-9"><div class="btn-group" role="group" aria-label="Basic example"></div></div></div> <div class="row mb-3"><span class="col-sm-3 col-form-label">Flip</span> <div class="col-sm-9"><div class="btn-group" role="group" aria-label="Basic example"></div></div></div> <div class="row mb-3"><label for="rotateInput" class="col-sm-3 col-form-label">Rotate</label> <div class="col-sm-9 row"><div class="col-md-8 py-2"><input type="range" class="form-control-range" id="rotateInput" min="-360" max="360" step="1"/></div> <div class="col-md-4"><div class="form-control text-center"> </div></div></div></div></form></div> <div class="col-md row"></div></div></div>`);

export default function Showcase($$anchor, $$props) {
	let model = { size: 5, pull: undefined, flip: undefined, rotate: 0 };
	let pull = ["None", "Left", "Right"];
	let flip = ["None", "Horizontal", "Vertical", "Both"];
	let icons = [faFlag, faHome, faCog, faSeedling];
	let iconsTitles = ["flag", "home", "cog", "seedling"];

	function setPull(value) {
		let pull = undefined;

		if (value === "Left") {
			pull = "left";
		} else if (value === "Right") {
			pull = "right";
		}

		model.pull = pull;
	}

	function setFlip(value) {
		let flip = undefined;

		if (value === "Horizontal") {
			flip = "horizontal";
		} else if (value === "Vertical") {
			flip = "vertical";
		} else if (value === "Both") {
			flip = "both";
		}

		model.flip = flip;
	}

	var div = root_2();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var form = $.sibling($.child(div_2), 6);
	var div_3 = $.child(form);
	var div_4 = $.sibling($.child(div_3), 2);
	var div_5 = $.child(div_4);
	var input = $.child(div_5);

	$.remove_input_defaults(input);
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var div_7 = $.child(div_6);
	var text = $.only_child(div_7);

	$.reset(div_6);
	$.reset(div_4);
	$.reset(div_3);

	var div_8 = $.sibling(div_3, 2);
	var div_9 = $.sibling($.child(div_8), 2);
	var div_10 = $.child(div_9);

	$.each(div_10, 20, () => pull, (p) => p, ($$anchor, p) => {
		var button = root();
		var text_1 = $.only_child(button, true);

		$.template_effect(
			($0) => {
				$.set_class(button, 1, $0, 'svelte-8eaich');
				$.set_text(text_1, p);
			},
			[
				() => `btn btn-${model.pull == (p == "None" ? undefined : p.toLowerCase()) ? "primary" : "secondary"}`
			]
		);

		$.event('click', button, () => setPull(p));
		$.append($$anchor, button);
	});

	$.reset(div_10);
	$.reset(div_9);
	$.reset(div_8);

	var div_11 = $.sibling(div_8, 2);
	var div_12 = $.sibling($.child(div_11), 2);
	var div_13 = $.child(div_12);

	$.each(div_13, 20, () => flip, (f) => f, ($$anchor, f) => {
		var button_1 = root();
		var text_2 = $.only_child(button_1, true);

		$.template_effect(
			($0) => {
				$.set_class(button_1, 1, $0, 'svelte-8eaich');
				$.set_text(text_2, f);
			},
			[
				() => `btn btn-${model.flip == (f == "None" ? undefined : f.toLowerCase()) ? "primary" : "secondary"}`
			]
		);

		$.event('click', button_1, () => setFlip(f));
		$.append($$anchor, button_1);
	});

	$.reset(div_13);
	$.reset(div_12);
	$.reset(div_11);

	var div_14 = $.sibling(div_11, 2);
	var div_15 = $.sibling($.child(div_14), 2);
	var div_16 = $.child(div_15);
	var input_1 = $.child(div_16);

	$.remove_input_defaults(input_1);
	$.reset(div_16);

	var div_17 = $.sibling(div_16, 2);
	var div_18 = $.child(div_17);
	var text_3 = $.only_child(div_18);

	$.reset(div_17);
	$.reset(div_15);
	$.reset(div_14);
	$.reset(form);
	$.reset(div_2);

	var div_19 = $.sibling(div_2, 2);

	$.each(div_19, 21, () => icons, $.index, ($$anchor, icon, i) => {
		var div_20 = root_1();
		var node = $.child(div_20);

		{
			let $0 = $.derived(() => `${model.size}x`);

			Fa(node, {
				get icon() {
					return $.get(icon);
				},

				get flip() {
					return model.flip;
				},

				get pull() {
					return model.pull;
				},

				get rotate() {
					return model.rotate;
				},

				get size() {
					return $.get($0);
				},

				get title() {
					return iconsTitles[i];
				}
			});
		}

		$.reset(div_20);
		$.append($$anchor, div_20);
	});

	$.reset(div_19);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, `${model.size ?? ''}x`);
		$.set_text(text_3, `${model.rotate ?? ''}deg`);
	});

	$.bind_value(input, () => model.size, ($$value) => model.size = $$value);
	$.bind_value(input_1, () => model.rotate, ($$value) => model.rotate = $$value);

	$.event('submit', form, $.preventDefault(function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	}));

	$.append($$anchor, div);
}