import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';

export default function ResultsCard($$renderer, $$props) {
	let {
		title,
		onCopy,
		copied = false,
		copyText = 'Copy Results',
		copiedText = 'Copied!',
		showCopyButton = true,
		children
	} = $$props;

	$$renderer.push(`<div class="card results-card"><div class="card-header row"><h3>${$.escape(title)}</h3> `);

	if (showCopyButton && onCopy) {
		$$renderer.push(`<!--[0--><button class="copy-btn"${$.attr('disabled', copied, true)}><span${$.attr_class($.clsx(copied ? 'text-green-500' : ''))}>`);
		Icon($$renderer, { name: copied ? 'check' : 'copy', size: 'xs' });
		$$renderer.push(`<!----></span> ${$.escape(copied ? copiedText : copyText)}</button>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div> <div class="card-content">`);
	children($$renderer);
	$$renderer.push(`<!----></div></div>`);
}