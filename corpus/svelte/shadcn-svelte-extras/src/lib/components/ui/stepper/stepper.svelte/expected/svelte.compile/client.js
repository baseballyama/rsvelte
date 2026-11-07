import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useStepperRoot } from './stepper.svelte.js';
import { box } from 'svelte-toolbelt';

export default function Stepper($$anchor, $$props) {
	$.push($$props, true);

	let step = $.prop($$props, 'step', 15, 1);

	useStepperRoot({ step: box.with(() => step(), (v) => step(v)) });

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}