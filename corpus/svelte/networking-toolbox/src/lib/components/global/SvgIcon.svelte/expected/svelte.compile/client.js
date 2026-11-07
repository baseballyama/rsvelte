import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<path fill-rule="evenodd" clip-rule="evenodd"></path>`);
var root_1 = $.from_svg(`<path></path>`);
var root_2 = $.from_svg(`<svg fill="currentColor" viewBox="0 0 20 20"><!></svg>`);

export default function SvgIcon($$anchor, $$props) {
	$.push($$props, true);

	let size = $.prop($$props, 'size', 3, 'md'),
		className = $.prop($$props, 'class', 3, '');

	const iconPaths = {
		check: 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
		clipboard: 'M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z',
		close: 'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z',
		sun: 'M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z',
		moon: 'M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z',
		bulb: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
	};

	const sizeClass = ({ sm: 'icon-sm', md: 'icon-md', lg: 'icon-lg' })[size()];
	var svg = root_2();
	var node = $.child(svg);

	{
		var consequent = ($$anchor) => {
			var path = root();

			$.template_effect(() => $.set_attribute(path, 'd', iconPaths.check));
			$.append($$anchor, path);
		};

		var consequent_1 = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, () => iconPaths.clipboard.split(' M'), $.index, ($$anchor, pathData, i) => {
				var path_1 = root_1();

				$.template_effect(() => $.set_attribute(path_1, 'd', i === 0 ? $.get(pathData) : 'M' + $.get(pathData)));
				$.append($$anchor, path_1);
			});

			$.append($$anchor, fragment);
		};

		var consequent_2 = ($$anchor) => {
			var path_2 = root();

			$.template_effect(() => $.set_attribute(path_2, 'd', iconPaths.close));
			$.append($$anchor, path_2);
		};

		var consequent_3 = ($$anchor) => {
			var path_3 = root();

			$.template_effect(() => $.set_attribute(path_3, 'd', iconPaths.sun));
			$.append($$anchor, path_3);
		};

		var consequent_4 = ($$anchor) => {
			var path_4 = root_1();

			$.template_effect(() => $.set_attribute(path_4, 'd', iconPaths.moon));
			$.append($$anchor, path_4);
		};

		var consequent_5 = ($$anchor) => {
			var path_5 = root_1();

			$.template_effect(() => $.set_attribute(path_5, 'd', iconPaths.bulb));
			$.append($$anchor, path_5);
		};

		$.if(node, ($$render) => {
			if ($$props.icon === 'check') $$render(consequent); else if ($$props.icon === 'clipboard') $$render(consequent_1, 1); else if ($$props.icon === 'close') $$render(consequent_2, 2); else if ($$props.icon === 'sun') $$render(consequent_3, 3); else if ($$props.icon === 'moon') $$render(consequent_4, 4); else if ($$props.icon === 'bulb') $$render(consequent_5, 5);
		});
	}

	$.reset(svg);
	$.template_effect(() => $.set_class(svg, 0, `${sizeClass ?? ''} ${className() ?? ''}`, 'svelte-1g5nppp'));
	$.append($$anchor, svg);
	$.pop();
}