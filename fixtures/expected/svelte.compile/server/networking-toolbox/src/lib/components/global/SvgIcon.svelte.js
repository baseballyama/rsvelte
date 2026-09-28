import * as $ from 'svelte/internal/server';

export default function SvgIcon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { icon, size = 'md', class: className = '' } = $$props;

		const iconPaths = {
			check: 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
			clipboard: 'M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z',
			close: 'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z',
			sun: 'M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z',
			moon: 'M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z',
			bulb: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
		};

		const sizeClass = ({ sm: 'icon-sm', md: 'icon-md', lg: 'icon-lg' })[size];

		$$renderer.push(`<svg fill="currentColor" viewBox="0 0 20 20"${$.attr_class(`${$.stringify(sizeClass)} ${$.stringify(className)}`, 'svelte-1g5nppp')}>`);

		if (icon === 'check') {
			$$renderer.push(`<!--[0--><path fill-rule="evenodd"${$.attr('d', iconPaths.check)} clip-rule="evenodd"></path>`);
		} else if (icon === 'clipboard') {
			$$renderer.push(`<!--[1--><!--[-->`);

			const each_array = $.ensure_array_like(iconPaths.clipboard.split(' M'));

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let pathData = each_array[i];

				$$renderer.push(`<path${$.attr('d', i === 0 ? pathData : 'M' + pathData)}></path>`);
			}

			$$renderer.push(`<!--]-->`);
		} else if (icon === 'close') {
			$$renderer.push(`<!--[2--><path fill-rule="evenodd"${$.attr('d', iconPaths.close)} clip-rule="evenodd"></path>`);
		} else if (icon === 'sun') {
			$$renderer.push(`<!--[3--><path fill-rule="evenodd"${$.attr('d', iconPaths.sun)} clip-rule="evenodd"></path>`);
		} else if (icon === 'moon') {
			$$renderer.push(`<!--[4--><path${$.attr('d', iconPaths.moon)}></path>`);
		} else if (icon === 'bulb') {
			$$renderer.push(`<!--[5--><path${$.attr('d', iconPaths.bulb)}></path>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></svg>`);
	});
}