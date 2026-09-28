import * as $ from 'svelte/internal/server';
import manual_image1 from './no.png';
import manual_image2 from './no.svg';

export default function Input($$renderer) {
	const src = manual_image1;
	const images = [manual_image1, manual_image2];
	const get_image = (image_key) => images[image_key];
	let foo = 'bar';

	$$renderer.push(`<!---->${$.escape(foo)} <img src="./dev.png" alt="non-enhanced test"/> <enhanced:img src="./dev.png" alt="dev test"></enhanced:img> <div><enhanced:img src="./dev.png" alt="nested test"></enhanced:img></div> <enhanced:img src="./prod.png" alt="production test"></enhanced:img> <enhanced:img src="./dev.png" width="5" height="10" alt="dimensions test"></enhanced:img> <enhanced:img src="./dev.png?blur=5" alt="directive test"></enhanced:img> <enhanced:img${$.attributes({ src: './dev.png', ...{ foo }, alt: 'spread attributes test' })}></enhanced:img> <enhanced:img src="./dev.png?w=1024,640,320" sizes="(min-width: 60rem) 80vw, (min-width: 40rem) 90vw, 100vw" alt="sizes test"></enhanced:img> <enhanced:img src="./dev.png" alt="event handler test"></enhanced:img> <enhanced:img src="#lib/dev.png" alt="alias test"></enhanced:img> <enhanced:img src="/src/dev.png" alt="absolute path test"></enhanced:img> <enhanced:img${$.attr('src', src)} alt="attribute shorthand test"></enhanced:img> <!--[-->`);

	const each_array = $.ensure_array_like(images);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let image = each_array[$$index];

		$$renderer.push(`<enhanced:img${$.attr('src', image)} alt="opt-in test"></enhanced:img>`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_1 = $.ensure_array_like(images);

	for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
		let _ = each_array_1[i];

		$$renderer.push(`<enhanced:img${$.attr('src', get_image(i))} alt="opt-in test"></enhanced:img>`);
	}

	$$renderer.push(`<!--]--> <picture><source src="./dev.avif"/> <source srcset="./dev.avif 500v ./bar.avif 100v"/> <source srcset="./dev.avif, ./bar.avif 1v"/></picture>`);
}