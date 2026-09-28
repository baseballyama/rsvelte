import * as $ from 'svelte/internal/server';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import DefaultFocus from './_DefaultFocus.svelte';
import Event from './_Event.svelte';
import Mandatory from './_Mandatory.svelte';
import List from './_List.svelte';
import Selection from './_Selection.svelte';
import Sliders from './_Sliders.svelte';
import NonCloseButton from './_NonCloseButton.svelte';
import LargeScroll from './_LargeScroll.svelte';
import Fullscreen from './_Fullscreen.svelte';
import OverFullscreen from './_OverFullscreen.svelte';
import Sheet from './_Sheet.svelte';
import ManyActions from './_ManyActions.svelte';

export default function _page($$renderer) {
	$.head('w70x89', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Dialogs - SMUI</title>`);
		});
	});

	$$renderer.push(`<section><h2>Dialogs</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/dialog</pre> <h5>Demos</h5> `);
	Demo($$renderer, { component: Simple, file: 'dialog/_Simple.svelte' });
	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: DefaultFocus,
		file: 'dialog/_DefaultFocus.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default, initially focused button`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Event,
		file: 'dialog/_Event.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Using dialog events instead of button clicks`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Mandatory,
		file: 'dialog/_Mandatory.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Mandatory dialog (won't close on scrim click or Esc key)`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: List,
		file: 'dialog/_List.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->No actions, and a very long selection list dialog`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Selection,
		file: 'dialog/_Selection.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Selection dialog`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: Sliders,
		file: 'dialog/_Sliders.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Dialog with sliders`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: NonCloseButton,
		file: 'dialog/_NonCloseButton.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Dialog with button that doesn't close`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Demo($$renderer, {
		component: LargeScroll,
		file: 'dialog/_LargeScroll.svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Large, scrollable dialog`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Note that dialogs will only be fullscreen on mobile sized screens. On
      desktop sized screens, it will be shown as a modal dialog.`);
		}

		Demo($$renderer, {
			component: Fullscreen,
			file: 'dialog/_Fullscreen.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Fullscreen dialog`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Note that the Material Spec states that the only time a dialog should be
      placed on top of another dialog is a confirmation dialog showing on top of
      a fullscreen dialog.`);
		}

		Demo($$renderer, {
			component: OverFullscreen,
			file: 'dialog/_OverFullscreen.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Dialog over fullscreen dialog`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Floating sheets are dialogs with a close icon button. Having the close
      icon button is mutually exclusive with having action bar buttons (e.g.
      cancel and OK buttons). The icon button is absolutely positioned.`);
		}

		Demo($$renderer, {
			component: Sheet,
			file: 'dialog/_Sheet.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Floating sheet dialog`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function subtitle($$renderer) {
			$$renderer.push(`<!---->Actions buttons will stack automatically if the dialog is too narrow. If
      you want them to stack regardless, you can force it.`);
		}

		Demo($$renderer, {
			component: ManyActions,
			file: 'dialog/_ManyActions.svelte',
			subtitle,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Too many action buttons for one line`);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$$renderer.push(`<!----></section>`);
}