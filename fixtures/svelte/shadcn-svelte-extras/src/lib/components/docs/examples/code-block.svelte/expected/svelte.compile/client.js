import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Svelte } from '$lib/components/icons';
import * as Code from '$lib/components/ui/code';
import { CopyButton } from '$lib/components/ui/copy-button';

var root = $.from_html(`<div class="border-border bg-card overflow-hidden rounded-lg border"><div class="border-border flex place-items-center justify-between border-b p-2"><div class="flex place-items-center gap-2"><!> <span class="text-muted-foreground font-mono text-sm font-light">src/routes/+layout.svelte</span></div> <!></div> <!></div>`);

export default function Code_block($$anchor) {
	let code = `\<script\>
    import { ModeWatcher } from "mode-watcher";    
\</script\>

<ModeWatcher/>`;

	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Svelte(node, { class: 'size-4' });
	$.next(2);
	$.reset(div_2);

	var node_1 = $.sibling(div_2, 2);

	CopyButton(node_1, { text: code, tabindex: -1, class: 'size-7' });
	$.reset(div_1);

	var node_2 = $.sibling(div_1, 2);

	$.component(node_2, () => Code.Root, ($$anchor, Code_Root) => {
		Code_Root($$anchor, {
			lang: 'svelte',
			class: 'border-none',
			code,
			highlight: [2, 5]
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}