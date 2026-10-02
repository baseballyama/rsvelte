import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Showcase from './_Showcase.svelte';
import Standard from './_Standard.svelte';
import Filled from './_Filled.svelte';
import Outlined from './_Outlined.svelte';
import ShapedFilled from './_ShapedFilled.svelte';
import ShapedOutlined from './_ShapedOutlined.svelte';
import Required from './_Required.svelte';
import Disabled from './_Disabled.svelte';
import Prefixed from './_Prefixed.svelte';
import Suffixed from './_Suffixed.svelte';
import NoLabelOrHelperText from './_NoLabelOrHelperText.svelte';
import PersistentHelperText from './_PersistentHelperText.svelte';
import CharacterCount from './_CharacterCount.svelte';
import HelperTextCharacterCount from './_HelperTextCharacterCount.svelte';
import BothIcons from './_BothIcons.svelte';
import ConditionalIcons from './_ConditionalIcons.svelte';
import Textarea from './_Textarea.svelte';
import TextareaCharacterCount from './_TextareaCharacterCount.svelte';
import FullWidth from './_FullWidth.svelte';
import FullWidthTextarea from './_FullWidthTextarea.svelte';
import FixedSizeTextarea from './_FixedSizeTextarea.svelte';
import ElementsInLabel from './_ElementsInLabel.svelte';
import DifferentTypes from './_DifferentTypes.svelte';
import NullAndUndefined from './_NullAndUndefined.svelte';
import ManualSetup from './_ManualSetup.svelte';
import Solo from './_Solo.svelte';

var root = $.from_html(`<section class="svelte-28pqhw"><h2 class="svelte-28pqhw">Text Field</h2> <h5 class="svelte-28pqhw">Installation</h5> <pre class="demo-spaced svelte-28pqhw">npm i -D @smui/textfield</pre> <h5 class="svelte-28pqhw">Demos</h5> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('28pqhw', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Text Field - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Showcase;
		},
		file: 'textfield/_Showcase.svelte'
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return Standard;
		},
		file: 'textfield/_Standard.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Standard');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return Filled;
		},
		file: 'textfield/_Filled.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Filled');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return Outlined;
		},
		file: 'textfield/_Outlined.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Outlined');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_3 = $.text('Styled with CSS');

			$.append($$anchor, text_3);
		};

		Demo(node_4, {
			get component() {
				return ShapedFilled;
			},
			file: 'textfield/_ShapedFilled.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_4 = $.text('Shaped Filled');

				$.append($$anchor, text_4);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_5 = $.sibling(node_4, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_5 = $.text('Styled with CSS');

			$.append($$anchor, text_5);
		};

		Demo(node_5, {
			get component() {
				return ShapedOutlined;
			},
			file: 'textfield/_ShapedOutlined.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_6 = $.text('Shaped Outlined');

				$.append($$anchor, text_6);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_6 = $.sibling(node_5, 2);

	Demo(node_6, {
		get component() {
			return Required;
		},
		file: 'textfield/_Required.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Required');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Demo(node_7, {
		get component() {
			return Disabled;
		},
		file: 'textfield/_Disabled.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('Disabled');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Demo(node_8, {
		get component() {
			return Prefixed;
		},
		file: 'textfield/_Prefixed.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('Prefixed');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	Demo(node_9, {
		get component() {
			return Suffixed;
		},
		file: 'textfield/_Suffixed.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('Suffixed');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 2);

	Demo(node_10, {
		get component() {
			return NoLabelOrHelperText;
		},
		file: 'textfield/_NoLabelOrHelperText.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_11 = $.text('Without label or helper text');

			$.append($$anchor, text_11);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	Demo(node_11, {
		get component() {
			return PersistentHelperText;
		},
		file: 'textfield/_PersistentHelperText.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_12 = $.text('With persistent helper text');

			$.append($$anchor, text_12);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 2);

	Demo(node_12, {
		get component() {
			return CharacterCount;
		},
		file: 'textfield/_CharacterCount.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_13 = $.text('With character count');

			$.append($$anchor, text_13);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 2);

	Demo(node_13, {
		get component() {
			return HelperTextCharacterCount;
		},
		file: 'textfield/_HelperTextCharacterCount.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_14 = $.text('With helper text and character count');

			$.append($$anchor, text_14);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_13, 2);

	Demo(node_14, {
		get component() {
			return BothIcons;
		},
		file: 'textfield/_BothIcons.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_15 = $.text('Both icons');

			$.append($$anchor, text_15);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_14, 2);

	Demo(node_15, {
		get component() {
			return ConditionalIcons;
		},
		file: 'textfield/_ConditionalIcons.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_16 = $.text('Conditional icons');

			$.append($$anchor, text_16);
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_15, 2);

	Demo(node_16, {
		get component() {
			return Textarea;
		},
		file: 'textfield/_Textarea.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_17 = $.text('Textarea');

			$.append($$anchor, text_17);
		},
		$$slots: { default: true }
	});

	var node_17 = $.sibling(node_16, 2);

	Demo(node_17, {
		get component() {
			return TextareaCharacterCount;
		},
		file: 'textfield/_TextareaCharacterCount.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_18 = $.text('Textarea with character count');

			$.append($$anchor, text_18);
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_17, 2);

	Demo(node_18, {
		get component() {
			return FullWidth;
		},
		file: 'textfield/_FullWidth.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_19 = $.text('Full width');

			$.append($$anchor, text_19);
		},
		$$slots: { default: true }
	});

	var node_19 = $.sibling(node_18, 2);

	Demo(node_19, {
		get component() {
			return FullWidthTextarea;
		},
		file: 'textfield/_FullWidthTextarea.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_20 = $.text('Full width textarea');

			$.append($$anchor, text_20);
		},
		$$slots: { default: true }
	});

	var node_20 = $.sibling(node_19, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_21 = $.text('Turn off the browser\'s native resize feature.');

			$.append($$anchor, text_21);
		};

		Demo(node_20, {
			get component() {
				return FixedSizeTextarea;
			},
			file: 'textfield/_FixedSizeTextarea.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_22 = $.text('Fixed Size Textarea');

				$.append($$anchor, text_22);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_21 = $.sibling(node_20, 2);

	Demo(node_21, {
		get component() {
			return ElementsInLabel;
		},
		file: 'textfield/_ElementsInLabel.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_23 = $.text('Elements in the label');

			$.append($$anchor, text_23);
		},
		$$slots: { default: true }
	});

	var node_22 = $.sibling(node_21, 2);

	Demo(node_22, {
		get component() {
			return DifferentTypes;
		},
		file: 'textfield/_DifferentTypes.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_24 = $.text('Different input types');

			$.append($$anchor, text_24);
		},
		$$slots: { default: true }
	});

	var node_23 = $.sibling(node_22, 2);

	Demo(node_23, {
		get component() {
			return NullAndUndefined;
		},
		file: 'textfield/_NullAndUndefined.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_25 = $.text('Empty Value Meaning Null and Undefined');

			$.append($$anchor, text_25);
		},
		$$slots: { default: true }
	});

	var node_24 = $.sibling(node_23, 2);

	Demo(node_24, {
		get component() {
			return ManualSetup;
		},
		file: 'textfield/_ManualSetup.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_26 = $.text('Manual setup');

			$.append($$anchor, text_26);
		},
		$$slots: { default: true }
	});

	var node_25 = $.sibling(node_24, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_27 = $.text('Using Paper and an Input outside a Textfield to create a "Solo" input');

			$.append($$anchor, text_27);
		};

		Demo(node_25, {
			get component() {
				return Solo;
			},
			file: 'textfield/_Solo.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_28 = $.text('Solo style');

				$.append($$anchor, text_28);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$.reset(section);
	$.append($$anchor, section);
}