import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ToggleButton from './ToggleButton.svelte';

var root = $.from_html(`<div class="options svelte-1s540ba"><div class="options-title svelte-1s540ba">global options (<a href="/docs/types/InspectOptions" style="text-decoration: none;">docs</a>)</div> <button class="reset-button svelte-1s540ba">reset</button> <label style="flex-basis: 100%; margin-top: 1ch" class="svelte-1s540ba">theme <select name="theme" style="width: 100%" class="svelte-1s540ba"><option>inspect</option><option>drak</option><option>stereo</option><option>dark</option><option>light</option><option>plain</option></select></label> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <label title="animation rate" class="svelte-1s540ba">anim rate <input type="number" min="0.1" max="10" style="width: 5em" name="animation-rate" class="svelte-1s540ba"/></label> <label class="svelte-1s540ba">store <select name="stores" class="svelte-1s540ba"><option>full</option><option>value only</option><option>off</option></select></label> <label class="svelte-1s540ba">elementview <select name="element-view" class="svelte-1s540ba"><option>simple</option><option>full</option></select></label> <label class="svelte-1s540ba">quotes <select name="quotes" class="svelte-1s540ba"><option>single</option><option>double</option><option>none</option></select></label> <label class="svelte-1s540ba">collapse strings <input type="number" min="0" style="width: 5em" name="collapse-strings" class="svelte-1s540ba"/></label> <label class="svelte-1s540ba">preview depth <input type="number" min="0" style="width: 5em" name="preview-depth" class="svelte-1s540ba"/></label> <label class="svelte-1s540ba">preview entries <input type="number" min="0" style="width: 5em" name="preview-entries" class="svelte-1s540ba"/></label> <label class="svelte-1s540ba">search <select name="search" class="svelte-1s540ba"><option>off</option><option>highlight</option><option>filter</option><option>filter-strict</option></select></label> <!></div>`);

export default function GlobalOptions($$anchor, $$props) {
	$.push($$props, true);

	let options = $.prop($$props, 'options', 15),
		onreset = $.prop($$props, 'onreset', 3, () => {});

	var div = root();
	var button = $.sibling($.child(div), 2);
	var label = $.sibling(button, 2);
	var select = $.sibling($.child(label));

	$.init_select(select);
	$.reset(label);

	var node = $.sibling(label, 2);

	ToggleButton(node, {
		get checked() {
			return options().showLength;
		},

		set checked($$value) {
			options(options().showLength = $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('lengths');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	ToggleButton(node_1, {
		get checked() {
			return options().showTypes;
		},

		set checked($$value) {
			options(options().showTypes = $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('types');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	ToggleButton(node_2, {
		get checked() {
			return options().showTools;
		},

		set checked($$value) {
			options(options().showTools = $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('tools');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	ToggleButton(node_3, {
		get checked() {
			return options().showPreview;
		},

		set checked($$value) {
			options(options().showPreview = $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('previews');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	ToggleButton(node_4, {
		get checked() {
			return options().noanimate;
		},

		set checked($$value) {
			options(options().noanimate = $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('noanimate');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	ToggleButton(node_5, {
		get checked() {
			return options().heading;
		},

		set checked($$value) {
			options(options().heading = $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('heading');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	ToggleButton(node_6, {
		get checked() {
			return options().borderless;
		},

		set checked($$value) {
			options(options().borderless = $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('borderless');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	ToggleButton(node_7, {
		get checked() {
			return options().flashOnUpdate;
		},

		set checked($$value) {
			options(options().flashOnUpdate = $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('flash on update');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	ToggleButton(node_8, {
		get checked() {
			return options().embedMedia;
		},

		set checked($$value) {
			options(options().embedMedia = $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('embed media');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	ToggleButton(node_9, {
		get checked() {
			return options().parseJson;
		},

		set checked($$value) {
			options(options().parseJson = $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('parse json');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	var label_1 = $.sibling(node_9, 2);
	var input = $.sibling($.child(label_1));

	$.remove_input_defaults(input);
	$.set_attribute(input, 'step', 0.1);
	$.reset(label_1);

	var label_2 = $.sibling(label_1, 2);
	var select_1 = $.sibling($.child(label_2));
	var option = $.sibling($.child(select_1));

	option.value = option.__value = 'value-only';

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = false;
	$.reset(select_1);
	$.init_select(select_1);
	$.reset(label_2);

	var label_3 = $.sibling(label_2, 2);
	var select_2 = $.sibling($.child(label_3));

	$.init_select(select_2);
	$.reset(label_3);

	var label_4 = $.sibling(label_3, 2);
	var select_3 = $.sibling($.child(label_4));

	$.init_select(select_3);
	$.reset(label_4);

	var label_5 = $.sibling(label_4, 2);
	var input_1 = $.sibling($.child(label_5));

	$.remove_input_defaults(input_1);
	$.reset(label_5);

	var label_6 = $.sibling(label_5, 2);
	var input_2 = $.sibling($.child(label_6));

	$.remove_input_defaults(input_2);
	$.reset(label_6);

	var label_7 = $.sibling(label_6, 2);
	var input_3 = $.sibling($.child(label_7));

	$.remove_input_defaults(input_3);
	$.reset(label_7);

	var label_8 = $.sibling(label_7, 2);
	var select_4 = $.sibling($.child(label_8));
	var option_2 = $.child(select_4);

	option_2.value = option_2.__value = false;
	$.next(3);
	$.reset(select_4);
	$.init_select(select_4);
	$.reset(label_8);

	var node_10 = $.sibling(label_8, 2);

	{
		var consequent = ($$anchor) => {
			ToggleButton($$anchor, {
				get checked() {
					return options().highlightMatches;
				},

				set checked($$value) {
					options(options().highlightMatches = $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_10 = $.text('highlight');

					$.append($$anchor, text_10);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_10, ($$render) => {
			if (options().search) $$render(consequent);
		});
	}

	$.reset(div);

	$.delegated('click', button, function (...$$args) {
		onreset()?.apply(this, $$args);
	});

	$.bind_select_value(select, () => options().theme, ($$value) => options(options().theme = $$value, true));
	$.bind_value(input, () => options().animRate, ($$value) => options(options().animRate = $$value, true));
	$.bind_select_value(select_1, () => options().stores, ($$value) => options(options().stores = $$value, true));
	$.bind_select_value(select_2, () => options().elementView, ($$value) => options(options().elementView = $$value, true));
	$.bind_select_value(select_3, () => options().quotes, ($$value) => options(options().quotes = $$value, true));
	$.bind_value(input_1, () => options().stringCollapse, ($$value) => options(options().stringCollapse = $$value, true));
	$.bind_value(input_2, () => options().previewDepth, ($$value) => options(options().previewDepth = $$value, true));
	$.bind_value(input_3, () => options().previewEntries, ($$value) => options(options().previewEntries = $$value, true));
	$.bind_select_value(select_4, () => options().search, ($$value) => options(options().search = $$value, true));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);