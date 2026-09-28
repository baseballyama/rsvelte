import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import manual_image1 from './no.png';
import manual_image2 from './no.svg';

var root = $.from_html(`<img alt="attribute shorthand test"/>`);
var root_1 = $.from_html(`<source/>`);
var root_2 = $.from_html(`<picture><!> <img alt="attribute shorthand test"/></picture>`);
var root_3 = $.from_html(`<img alt="opt-in test"/>`);
var root_4 = $.from_html(`<picture><!> <img alt="opt-in test"/></picture>`);
var root_5 = $.from_html(` <img src="./dev.png" alt="non-enhanced test"/> <picture><source srcset="/1 1440w, /2 960w" type="image/avif"/><source srcset="/3 1440w, /4 960w" type="image/webp"/><source srcset="5 1440w, /6 960w" type="image/png"/><img src="/7" alt="dev test" width="1440" height="1440"/></picture> <div><picture><source srcset="/1 1440w, /2 960w" type="image/avif"/><source srcset="/3 1440w, /4 960w" type="image/webp"/><source srcset="5 1440w, /6 960w" type="image/png"/><img src="/7" alt="nested test" width="1440" height="1440"/></picture></div> <picture><source type="image/avif"/><source type="image/webp"/><source type="image/png"/><img alt="production test" width="1440" height="1440"/></picture> <picture><source srcset="/1 1440w, /2 960w" type="image/avif"/><source srcset="/3 1440w, /4 960w" type="image/webp"/><source srcset="5 1440w, /6 960w" type="image/png"/><img src="/7" width="5" height="10" alt="dimensions test"/></picture> <picture><source srcset="/1 1440w, /2 960w" type="image/avif"/><source srcset="/3 1440w, /4 960w" type="image/webp"/><source srcset="5 1440w, /6 960w" type="image/png"/><img src="/7" alt="directive test" width="1440" height="1440"/></picture> <picture><source srcset="/1 1440w, /2 960w" type="image/avif"/><source srcset="/3 1440w, /4 960w" type="image/webp"/><source srcset="5 1440w, /6 960w" type="image/png"/><img/></picture> <picture><source srcset="/1 1440w, /2 960w" sizes="(min-width: 60rem) 80vw, (min-width: 40rem) 90vw, 100vw" type="image/avif"/><source srcset="/3 1440w, /4 960w" sizes="(min-width: 60rem) 80vw, (min-width: 40rem) 90vw, 100vw" type="image/webp"/><source srcset="5 1440w, /6 960w" sizes="(min-width: 60rem) 80vw, (min-width: 40rem) 90vw, 100vw" type="image/png"/><img src="/7" alt="sizes test" width="1440" height="1440"/></picture> <picture><source srcset="/1 1440w, /2 960w" type="image/avif"/><source srcset="/3 1440w, /4 960w" type="image/webp"/><source srcset="5 1440w, /6 960w" type="image/png"/><img src="/7" alt="event handler test" width="1440" height="1440"/></picture> <picture><source srcset="/1 1440w, /2 960w" type="image/avif"/><source srcset="/3 1440w, /4 960w" type="image/webp"/><source srcset="5 1440w, /6 960w" type="image/png"/><img src="/7" alt="alias test" width="1440" height="1440"/></picture> <picture><source srcset="/1 1440w, /2 960w" type="image/avif"/><source srcset="/3 1440w, /4 960w" type="image/webp"/><source srcset="5 1440w, /6 960w" type="image/png"/><img src="/7" alt="absolute path test" width="1440" height="1440"/></picture> <!> <!> <!> <picture><source src="./dev.avif"/> <source srcset="./dev.avif 500v ./bar.avif 100v"/> <source srcset="./dev.avif, ./bar.avif 1v"/></picture>`, 1);

export default function Output($$anchor, $$props) {
	$.push($$props, true);

	const src = manual_image1;
	const images = [manual_image1, manual_image2];
	const get_image = (image_key) => images[image_key];
	let foo = 'bar';

	$.next();

	var fragment = root_5();
	var text = $.first_child(fragment);
	var picture = $.sibling(text, 7);
	var source = $.child(picture);

	$.set_attribute(source, 'srcset', "__VITE_ASSET__2AM7_y_a__ 1440w, __VITE_ASSET__2AM7_y_b__ 960w");

	var source_1 = $.sibling(source);

	$.set_attribute(source_1, 'srcset', "__VITE_ASSET__2AM7_y_c__ 1440w, __VITE_ASSET__2AM7_y_d__ 960w");

	var source_2 = $.sibling(source_1);

	$.set_attribute(source_2, 'srcset', "__VITE_ASSET__2AM7_y_e__ 1440w, __VITE_ASSET__2AM7_y_f__ 960w");

	var img = $.sibling(source_2);

	$.set_attribute(img, 'src', "__VITE_ASSET__2AM7_y_g__");
	$.reset(picture);

	var picture_1 = $.sibling(picture, 6);
	var img_1 = $.sibling($.child(picture_1), 3);

	$.attribute_effect(img_1, () => ({
		src: '/7',
		...{ foo },
		alt: 'spread attributes test',
		width: '1440',
		height: '1440'
	}));

	$.reset(picture_1);

	var picture_2 = $.sibling(picture_1, 4);
	var img_2 = $.sibling($.child(picture_2), 3);

	$.reset(picture_2);

	var node = $.sibling(picture_2, 6);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var text_1 = $.text();

					$.template_effect(() => $.set_text(text_1, `${src ?? ''} was not enhanced. Cannot determine dimensions.`));
					$.append($$anchor, text_1);
				};

				var alternate = ($$anchor) => {
					var img_3 = root();

					$.template_effect(() => $.set_attribute(img_3, 'src', src));
					$.append($$anchor, img_3);
				};

				$.if(node_1, ($$render) => {
					if (import.meta.env.DEV && false) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		var alternate_1 = ($$anchor) => {
			var picture_3 = root_2();
			var node_2 = $.child(picture_3);

			$.each(node_2, 17, () => Object.entries(src.sources), $.index, ($$anchor, $$item) => {
				var $$array = $.derived(() => $.to_array($.get($$item), 2));
				let format = () => $.get($$array)[0];
				let srcset = () => $.get($$array)[1];
				var source_3 = root_1();

				$.template_effect(() => {
					$.set_attribute(source_3, 'srcset', srcset());
					$.set_attribute(source_3, 'type', 'image/' + format());
				});

				$.append($$anchor, source_3);
			});

			var img_4 = $.sibling(node_2, 2);

			$.reset(picture_3);

			$.template_effect(() => {
				$.set_attribute(img_4, 'src', src.img.src);
				$.set_attribute(img_4, 'width', src.img.w);
				$.set_attribute(img_4, 'height', src.img.h);
			});

			$.append($$anchor, picture_3);
		};

		$.if(node, ($$render) => {
			if (typeof src === 'string') $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	var node_3 = $.sibling(node, 2);

	$.each(node_3, 17, () => images, $.index, ($$anchor, image) => {
		var fragment_3 = $.comment();
		var node_4 = $.first_child(fragment_3);

		{
			var consequent_3 = ($$anchor) => {
				var fragment_4 = $.comment();
				var node_5 = $.first_child(fragment_4);

				{
					var consequent_2 = ($$anchor) => {
						var text_2 = $.text();

						$.template_effect(() => $.set_text(text_2, `${$.get(image) ?? ''} was not enhanced. Cannot determine dimensions.`));
						$.append($$anchor, text_2);
					};

					var alternate_2 = ($$anchor) => {
						var img_5 = root_3();

						$.template_effect(() => $.set_attribute(img_5, 'src', $.get(image)));
						$.append($$anchor, img_5);
					};

					$.if(node_5, ($$render) => {
						if (import.meta.env.DEV && false) $$render(consequent_2); else $$render(alternate_2, -1);
					});
				}

				$.append($$anchor, fragment_4);
			};

			var alternate_3 = ($$anchor) => {
				var picture_4 = root_4();
				var node_6 = $.child(picture_4);

				$.each(node_6, 17, () => Object.entries($.get(image).sources), $.index, ($$anchor, $$item) => {
					var $$array_1 = $.derived(() => $.to_array($.get($$item), 2));
					let format = () => $.get($$array_1)[0];
					let srcset = () => $.get($$array_1)[1];
					var source_4 = root_1();

					$.template_effect(() => {
						$.set_attribute(source_4, 'srcset', srcset());
						$.set_attribute(source_4, 'type', 'image/' + format());
					});

					$.append($$anchor, source_4);
				});

				var img_6 = $.sibling(node_6, 2);

				$.reset(picture_4);

				$.template_effect(() => {
					$.set_attribute(img_6, 'src', $.get(image).img.src);
					$.set_attribute(img_6, 'width', $.get(image).img.w);
					$.set_attribute(img_6, 'height', $.get(image).img.h);
				});

				$.append($$anchor, picture_4);
			};

			$.if(node_4, ($$render) => {
				if (typeof $.get(image) === 'string') $$render(consequent_3); else $$render(alternate_3, -1);
			});
		}

		$.append($$anchor, fragment_3);
	});

	var node_7 = $.sibling(node_3, 2);

	$.each(node_7, 17, () => images, $.index, ($$anchor, _, i) => {
		var fragment_6 = $.comment();
		var node_8 = $.first_child(fragment_6);

		{
			var consequent_5 = ($$anchor) => {
				var fragment_7 = $.comment();
				var node_9 = $.first_child(fragment_7);

				{
					var consequent_4 = ($$anchor) => {
						var text_3 = $.text();

						$.template_effect(($0) => $.set_text(text_3, `${$0 ?? ''} was not enhanced. Cannot determine dimensions.`), [() => get_image(i)]);
						$.append($$anchor, text_3);
					};

					var alternate_4 = ($$anchor) => {
						var img_7 = root_3();

						$.template_effect(($0) => $.set_attribute(img_7, 'src', $0), [() => get_image(i)]);
						$.append($$anchor, img_7);
					};

					$.if(node_9, ($$render) => {
						if (import.meta.env.DEV && false) $$render(consequent_4); else $$render(alternate_4, -1);
					});
				}

				$.append($$anchor, fragment_7);
			};

			var d = $.derived(() => typeof get_image(i) === 'string');

			var alternate_5 = ($$anchor) => {
				var picture_5 = root_4();
				var node_10 = $.child(picture_5);

				$.each(node_10, 17, () => Object.entries(get_image(i).sources), $.index, ($$anchor, $$item) => {
					var $$array_2 = $.derived(() => $.to_array($.get($$item), 2));
					let format = () => $.get($$array_2)[0];
					let srcset = () => $.get($$array_2)[1];
					var source_5 = root_1();

					$.template_effect(() => {
						$.set_attribute(source_5, 'srcset', srcset());
						$.set_attribute(source_5, 'type', 'image/' + format());
					});

					$.append($$anchor, source_5);
				});

				var img_8 = $.sibling(node_10, 2);

				$.reset(picture_5);

				$.template_effect(
					($0, $1, $2) => {
						$.set_attribute(img_8, 'src', $0);
						$.set_attribute(img_8, 'width', $1);
						$.set_attribute(img_8, 'height', $2);
					},
					[
						() => get_image(i).img.src,
						() => get_image(i).img.w,
						() => get_image(i).img.h
					]
				);

				$.append($$anchor, picture_5);
			};

			$.if(node_8, ($$render) => {
				if ($.get(d)) $$render(consequent_5); else $$render(alternate_5, -1);
			});
		}

		$.append($$anchor, fragment_6);
	});

	$.next(2);
	$.template_effect(() => $.set_text(text, `${foo ?? ''} `));
	$.replay_events(img_1);
	$.delegated('click', img_2, () => foo = 'clicked an image!');
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);