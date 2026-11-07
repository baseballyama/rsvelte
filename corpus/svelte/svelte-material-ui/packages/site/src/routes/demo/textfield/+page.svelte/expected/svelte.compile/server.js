import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer) {
	$.head('28pqhw', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Text Field - SMUI</title>`);
		});
	});

	$$renderer.push(`<section class="svelte-28pqhw"><h2 class="svelte-28pqhw">Text Field</h2> <h5 class="svelte-28pqhw">Installation</h5> <pre class="demo-spaced svelte-28pqhw">npm i -D @smui/textfield</pre> <h5 class="svelte-28pqhw">Demos</h5> `);
	Demo($$renderer, { component: Showcase, file: 'textfield/_Showcase.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Standard,
		file: 'textfield/_Standard.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Standard`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Filled,
		file: 'textfield/_Filled.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Filled`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Outlined,
		file: 'textfield/_Outlined.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Outlined`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Styled with CSS`);
		}

		Demo($$renderer, {
			component: ShapedFilled,
			file: 'textfield/_ShapedFilled.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Shaped Filled`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Styled with CSS`);
		}

		Demo($$renderer, {
			component: ShapedOutlined,
			file: 'textfield/_ShapedOutlined.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Shaped Outlined`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Required,
		file: 'textfield/_Required.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Required`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Disabled,
		file: 'textfield/_Disabled.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disabled`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Prefixed,
		file: 'textfield/_Prefixed.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Prefixed`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Suffixed,
		file: 'textfield/_Suffixed.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Suffixed`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: NoLabelOrHelperText,
		file: 'textfield/_NoLabelOrHelperText.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Without label or helper text`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: PersistentHelperText,
		file: 'textfield/_PersistentHelperText.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->With persistent helper text`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: CharacterCount,
		file: 'textfield/_CharacterCount.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->With character count`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: HelperTextCharacterCount,
		file: 'textfield/_HelperTextCharacterCount.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->With helper text and character count`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: BothIcons,
		file: 'textfield/_BothIcons.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Both icons`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: ConditionalIcons,
		file: 'textfield/_ConditionalIcons.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Conditional icons`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Textarea,
		file: 'textfield/_Textarea.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Textarea`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: TextareaCharacterCount,
		file: 'textfield/_TextareaCharacterCount.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Textarea with character count`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: FullWidth,
		file: 'textfield/_FullWidth.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Full width`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: FullWidthTextarea,
		file: 'textfield/_FullWidthTextarea.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Full width textarea`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Turn off the browser's native resize feature.`);
		}

		Demo($$renderer, {
			component: FixedSizeTextarea,
			file: 'textfield/_FixedSizeTextarea.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Fixed Size Textarea`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: ElementsInLabel,
		file: 'textfield/_ElementsInLabel.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Elements in the label`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: DifferentTypes,
		file: 'textfield/_DifferentTypes.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Different input types`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: NullAndUndefined,
		file: 'textfield/_NullAndUndefined.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Empty Value Meaning Null and Undefined`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: ManualSetup,
		file: 'textfield/_ManualSetup.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Manual setup`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Using Paper and an Input outside a Textfield to create a "Solo" input`);
		}

		Demo($$renderer, {
			component: Solo,
			file: 'textfield/_Solo.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Solo style`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----></section>`);
}