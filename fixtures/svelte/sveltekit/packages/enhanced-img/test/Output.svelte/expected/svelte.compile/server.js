import * as $ from 'svelte/internal/server';
import manual_image1 from './no.png';
import manual_image2 from './no.svg';

export default function Output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const src = manual_image1;
		const images = [manual_image1, manual_image2];
		const get_image = (image_key) => images[image_key];
		let foo = 'bar';

		$$renderer.push(`<!---->${$.escape(foo)} <img src="./dev.png" alt="non-enhanced test"/> <picture><source srcset="/1 1440w, /2 960w" type="image/avif"/><source srcset="/3 1440w, /4 960w" type="image/webp"/><source srcset="5 1440w, /6 960w" type="image/png"/><img src="/7" alt="dev test" width="1440" height="1440"/></picture> <div><picture><source srcset="/1 1440w, /2 960w" type="image/avif"/><source srcset="/3 1440w, /4 960w" type="image/webp"/><source srcset="5 1440w, /6 960w" type="image/png"/><img src="/7" alt="nested test" width="1440" height="1440"/></picture></div> <picture><source srcset="__VITE_ASSET__2AM7_y_a__ 1440w, __VITE_ASSET__2AM7_y_b__ 960w" type="image/avif"/><source srcset="__VITE_ASSET__2AM7_y_c__ 1440w, __VITE_ASSET__2AM7_y_d__ 960w" type="image/webp"/><source srcset="__VITE_ASSET__2AM7_y_e__ 1440w, __VITE_ASSET__2AM7_y_f__ 960w" type="image/png"/><img src="__VITE_ASSET__2AM7_y_g__" alt="production test" width="1440" height="1440"/></picture> <picture><source srcset="/1 1440w, /2 960w" type="image/avif"/><source srcset="/3 1440w, /4 960w" type="image/webp"/><source srcset="5 1440w, /6 960w" type="image/png"/><img src="/7" width="5" height="10" alt="dimensions test"/></picture> <picture><source srcset="/1 1440w, /2 960w" type="image/avif"/><source srcset="/3 1440w, /4 960w" type="image/webp"/><source srcset="5 1440w, /6 960w" type="image/png"/><img src="/7" alt="directive test" width="1440" height="1440"/></picture> <picture><source srcset="/1 1440w, /2 960w" type="image/avif"/><source srcset="/3 1440w, /4 960w" type="image/webp"/><source srcset="5 1440w, /6 960w" type="image/png"/><img${$.attributes({
			src: '/7',
			...{ foo },
			alt: 'spread attributes test',
			width: '1440',
			height: '1440'
		})} onload="this.__e=event" onerror="this.__e=event"/></picture> <picture><source srcset="/1 1440w, /2 960w" sizes="(min-width: 60rem) 80vw, (min-width: 40rem) 90vw, 100vw" type="image/avif"/><source srcset="/3 1440w, /4 960w" sizes="(min-width: 60rem) 80vw, (min-width: 40rem) 90vw, 100vw" type="image/webp"/><source srcset="5 1440w, /6 960w" sizes="(min-width: 60rem) 80vw, (min-width: 40rem) 90vw, 100vw" type="image/png"/><img src="/7" alt="sizes test" width="1440" height="1440"/></picture> <picture><source srcset="/1 1440w, /2 960w" type="image/avif"/><source srcset="/3 1440w, /4 960w" type="image/webp"/><source srcset="5 1440w, /6 960w" type="image/png"/><img src="/7" alt="event handler test" width="1440" height="1440"/></picture> <picture><source srcset="/1 1440w, /2 960w" type="image/avif"/><source srcset="/3 1440w, /4 960w" type="image/webp"/><source srcset="5 1440w, /6 960w" type="image/png"/><img src="/7" alt="alias test" width="1440" height="1440"/></picture> <picture><source srcset="/1 1440w, /2 960w" type="image/avif"/><source srcset="/3 1440w, /4 960w" type="image/webp"/><source srcset="5 1440w, /6 960w" type="image/png"/><img src="/7" alt="absolute path test" width="1440" height="1440"/></picture> `);

		if (typeof src === 'string') {
			$$renderer.push('<!--[0-->');

			if (import.meta.env.DEV && false) {
				$$renderer.push(`<!--[0-->${$.escape(src)} was not enhanced. Cannot determine dimensions.`);
			} else {
				$$renderer.push(`<!--[-1--><img${$.attr('src', src)} alt="attribute shorthand test"/>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><picture><!--[-->`);

			const each_array = $.ensure_array_like(Object.entries(src.sources));

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let [format, srcset] = each_array[$$index];

				$$renderer.push(`<source${$.attr('srcset', srcset)}${$.attr('type', 'image/' + format)}/>`);
			}

			$$renderer.push(`<!--]--> <img${$.attr('src', src.img.src)} alt="attribute shorthand test"${$.attr('width', src.img.w)}${$.attr('height', src.img.h)}/></picture>`);
		}

		$$renderer.push(`<!--]--> <!--[-->`);

		const each_array_1 = $.ensure_array_like(images);

		for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
			let image = each_array_1[$$index_2];

			if (typeof image === 'string') {
				$$renderer.push('<!--[0-->');

				if (import.meta.env.DEV && false) {
					$$renderer.push(`<!--[0-->${$.escape(image)} was not enhanced. Cannot determine dimensions.`);
				} else {
					$$renderer.push(`<!--[-1--><img${$.attr('src', image)} alt="opt-in test"/>`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push(`<!--[-1--><picture><!--[-->`);

				const each_array_2 = $.ensure_array_like(Object.entries(image.sources));

				for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
					let [format, srcset] = each_array_2[$$index_1];

					$$renderer.push(`<source${$.attr('srcset', srcset)}${$.attr('type', 'image/' + format)}/>`);
				}

				$$renderer.push(`<!--]--> <img${$.attr('src', image.img.src)} alt="opt-in test"${$.attr('width', image.img.w)}${$.attr('height', image.img.h)}/></picture>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--> <!--[-->`);

		const each_array_3 = $.ensure_array_like(images);

		for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
			let _ = each_array_3[i];

			if (typeof get_image(i) === 'string') {
				$$renderer.push('<!--[0-->');

				if (import.meta.env.DEV && false) {
					$$renderer.push(`<!--[0-->${$.escape(get_image(i))} was not enhanced. Cannot determine dimensions.`);
				} else {
					$$renderer.push(`<!--[-1--><img${$.attr('src', get_image(i))} alt="opt-in test"/>`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push(`<!--[-1--><picture><!--[-->`);

				const each_array_4 = $.ensure_array_like(Object.entries(get_image(i).sources));

				for (let $$index_3 = 0, $$length = each_array_4.length; $$index_3 < $$length; $$index_3++) {
					let [format, srcset] = each_array_4[$$index_3];

					$$renderer.push(`<source${$.attr('srcset', srcset)}${$.attr('type', 'image/' + format)}/>`);
				}

				$$renderer.push(`<!--]--> <img${$.attr('src', get_image(i).img.src)} alt="opt-in test"${$.attr('width', get_image(i).img.w)}${$.attr('height', get_image(i).img.h)}/></picture>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--> <picture><source src="./dev.avif"/> <source srcset="./dev.avif 500v ./bar.avif 100v"/> <source srcset="./dev.avif, ./bar.avif 1v"/></picture>`);
	});
}