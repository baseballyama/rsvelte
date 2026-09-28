import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import TextCursor from '$lib/components/library/TextAnimations/TextCursor/TextCursor.svelte';
import source from '$lib/components/library/TextAnimations/TextCursor/TextCursor.svelte?raw';

export default function TextCursorDemo($$renderer) {
	const DEFAULTS = { text: '⚛️', followMouseDirection: true, randomFloat: true };
	let text = DEFAULTS.text;
	let followMouseDirection = DEFAULTS.followMouseDirection;
	let randomFloat = DEFAULTS.randomFloat;
	let replay = 0;
	const hasChanges = $.derived(() => text !== DEFAULTS.text || followMouseDirection !== DEFAULTS.followMouseDirection || randomFloat !== DEFAULTS.randomFloat);

	function reset() {
		text = DEFAULTS.text;
		followMouseDirection = DEFAULTS.followMouseDirection;
		randomFloat = DEFAULTS.randomFloat;
		replay++;
	}

	const usage = $.derived(() => `<TextCursor
  text="${text}"
  spacing={80}
  followMouseDirection={${followMouseDirection}}
  randomFloat={${randomFloat}}
  exitDuration={0.3}
  removalInterval={20}
  maxPoints={10}
/>`);

	const props = [
		{
			name: 'text',
			type: 'string',
			default: '"⚛️"',
			description: 'The text string to display as the trail.'
		},

		{
			name: 'spacing',
			type: 'number',
			default: '100',
			description: 'Spacing in pixels between each trail point.'
		},

		{
			name: 'followMouseDirection',
			type: 'boolean',
			default: 'true',
			description: 'If true, each text rotates to follow the mouse direction.'
		},

		{
			name: 'randomFloat',
			type: 'boolean',
			default: 'true',
			description: 'If true, enables random floating offsets in position and rotation.'
		},

		{
			name: 'exitDuration',
			type: 'number',
			default: '0.5',
			description: 'Duration in seconds for the exit (and entry opacity) animation of each trail item.'
		},

		{
			name: 'removalInterval',
			type: 'number',
			default: '30',
			description: 'Interval in milliseconds between removing trail items when the mouse stops moving.'
		},

		{
			name: 'maxPoints',
			type: 'number',
			default: '5',
			description: 'Maximum number of trail points to display.'
		}
	];

	$.head('6rybn3', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Text Cursor - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Text Cursor</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:400px;overflow:hidden;display:flex;align-items:center;justify-content:center;">`);
			ReplayButton($$renderer, { onClick: () => replay++ });
			$$renderer.push(`<!----> <!---->`);

			{
				TextCursor($$renderer, { text, followMouseDirection, randomFloat });
			}

			$$renderer.push(`<!----> <div style="pointer-events:none;position:absolute;text-align:center;font-size:4rem;font-weight:900;user-select:none;color:#2F293A;">Hover Around!</div></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'text-cursor', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewInput($$renderer, {
						title: 'Text',
						value: text,
						placeholder: 'Enter text...',
						maxlength: 10,
						onChange: (v) => text = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Follow Mouse Direction',
						checked: followMouseDirection,
						onChange: (v) => {
							followMouseDirection = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Enable Random Floating',
						checked: randomFloat,
						onChange: (v) => {
							randomFloat = v;
							replay++;
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		}

		function propTable($$renderer) {
			PropTable($$renderer, { rows: props });
		}

		TabsLayout($$renderer, {
			onreset: reset,
			hasChanges: hasChanges(),
			componentName: 'TextCursor',
			usage: usage(),
			source,
			props,
			preview,
			code,
			customize,
			propTable,
			$$slots: { preview: true, code: true, customize: true, propTable: true }
		});
	}

	$$renderer.push(`<!---->`);
}