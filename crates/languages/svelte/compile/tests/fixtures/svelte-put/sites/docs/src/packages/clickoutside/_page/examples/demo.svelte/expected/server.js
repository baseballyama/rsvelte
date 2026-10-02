import * as $ from 'svelte/internal/server';
import { clickoutside } from '@svelte-put/clickoutside';
import { quintOut } from 'svelte/easing';
import { fly } from 'svelte/transition';

export default function Demo($$renderer, $$props) {
	let { class: cls, $$slots, $$events, ...rest } = $$props;
	let enabled = true;
	let parent = undefined;
	let click = 0;

	function onClickOutside() {
		click++;
	}

	function toggleEnabled(e) {
		e.stopPropagation();
		enabled = !enabled;
	}

	$$renderer.push(`<fieldset${$.attributes({
		class: `border-error-fg hl-error select-none border-4 p-10 ${$.stringify(cls)}`,
		...rest
	})}><legend class="text-error-fg font-bold">  Limit  </legend> <div class="border-suscess-fg hl-success grid border-2 p-6"><p><code>use:clickoutside</code> is registered for this <strong>green box</strong>. Try these:</p> <ol><li>Click within this <strong>green</strong> zone => <strong>won't</strong> trigger <code>onclickoutside</code></li> <li>Click on the <strong>red</strong> zone => <strong>will</strong> trigger <code>onclickoutside</code></li> <li>Click outside the <strong>red</strong> limit => <strong>won't</strong> trigger <code>onclickoutside</code></li> <li>Enable/disable <code>use:clickoutside</code> with button below, then try (2) again</li></ol></div> <div class="flex items-center justify-between"><p><code>onclickoutside</code> counter: <!---->`);

	{
		$$renderer.push(`<strong class="inline-block">${$.escape(click)}</strong>`);
	}

	$$renderer.push(`<!----></p> <button class="c-btn">`);

	if (enabled) {
		$$renderer.push(`<!--[0-->Disable`);
	} else {
		$$renderer.push(`<!--[-1-->Enable`);
	}

	$$renderer.push(`<!--]--></button></div></fieldset>`);
}