import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Avatar from '@svelte-put/avatar/Avatar.svelte';

var root = $.from_html(`<img/>`);

export default function Custom_markup($$anchor) {
	{
		const img = ($$anchor, $$arg0) => {
			let src = () => ($$arg0?.()).src;
			let size = () => ($$arg0?.()).size;
			let alt = () => ($$arg0?.()).alt;
			let sources = () => ($$arg0?.()).sources;
			var img_1 = root();

			$.template_effect(() => {
				$.set_attribute(img_1, 'src', src());
				$.set_attribute(img_1, 'alt', alt());
				$.set_attribute(img_1, 'width', size());
				$.set_attribute(img_1, 'height', size());
				$.set_attribute(img_1, 'data-sources', sources());
			});

			$.append($$anchor, img_1);
		};

		Avatar($$anchor, {
			size: 50,
			gravatar: 'billy.hargrove@domain.com',
			uiAvatar: 'Billy+Hargrove',
			img,
			$$slots: { img: true }
		});
	}
}