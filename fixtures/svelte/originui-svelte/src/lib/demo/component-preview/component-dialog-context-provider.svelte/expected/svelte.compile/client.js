import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setComponentDialogCtx } from './component-dialog-context.svelte';

export default function Component_dialog_context_provider($$anchor, $$props) {
	$.push($$props, true);
	setComponentDialogCtx({});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children);
	$.append($$anchor, fragment);
	$.pop();
}