import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';

export default function ActionButton($$renderer, $$props) {
	let {
		loading = false,
		disabled = false,
		icon,
		loadingIcon = 'loader',
		loadingText,
		children,
		onclick,
		class: className = ''
	} = $$props;

	const isDisabled = $.derived(() => loading || disabled);

	$$renderer.push(`<button${$.attr_class(`lookup-btn ${$.stringify(className)}`)}${$.attr('disabled', isDisabled(), true)}>`);

	if (loading) {
		$$renderer.push('<!--[0-->');
		Icon($$renderer, { name: loadingIcon, size: 'sm', animate: 'spin' });
		$$renderer.push(`<!----> ${$.escape(loadingText || children)}`);
	} else {
		$$renderer.push('<!--[-1-->');

		if (icon) {
			$$renderer.push('<!--[0-->');
			Icon($$renderer, { name: icon, size: 'sm' });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		children($$renderer);
		$$renderer.push(`<!---->`);
	}

	$$renderer.push(`<!--]--></button>`);
}