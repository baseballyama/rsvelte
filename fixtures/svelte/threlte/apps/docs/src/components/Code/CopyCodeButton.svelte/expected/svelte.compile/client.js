import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button><span> </span> <svg xmlns="http://www.w3.org/2000/svg" width="76" height="76" fill="#000000" viewBox="0 0 256 256"><path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"></path><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path></svg> <svg xmlns="http://www.w3.org/2000/svg" width="76" height="76" fill="#000000" viewBox="0 0 256 256"><path d="M216,40V168H168V88H88V40Z" opacity="0.2"></path><path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"></path></svg></button>`);

export default function CopyCodeButton($$anchor, $$props) {
	let code = $.prop($$props, 'code', 3, '');
	let copying = $.state(false);
	let success = $.state(false);
	var button = root();
	var span = $.child(button);
	var text = $.only_child(span, true);
	var svg = $.sibling(span, 2);
	var svg_1 = $.sibling(svg, 2);

	$.reset(button);

	$.template_effect(() => {
		$.set_class(button, 1, $.clsx([
			'group/copybtn absolute top-0 right-0 flex items-center gap-1 p-1 max-md:hidden',
			$.get(success)
				? 'text-green-300'
				: 'text-white/30 hover:text-orange-400',
			$.get(copying) && 'scale-90'
		]));

		$.set_class(span, 1, $.clsx([
			'text-xs group-hover/copybtn:opacity-100',
			!$.get(success) && 'opacity-0'
		]));

		$.set_text(text, $.get(success) ? 'Success' : 'Copy');

		$.set_class(svg, 0, $.clsx([
			'h-5 w-5 fill-green-300',
			$.get(success) ? 'block' : 'hidden'
		]));

		$.set_class(svg_1, 0, $.clsx([
			'h-5 w-5 fill-white/20 group-hover/copybtn:fill-orange-400',
			$.get(success) ? 'hidden' : 'block'
		]));
	});

	$.delegated('click', button, () => {
		$.set(copying, true);
		navigator.clipboard.writeText(code());

		setTimeout(
			() => {
				$.set(copying, false);
				$.set(success, true);

				setTimeout(
					() => {
						$.set(success, false);
					},
					1500
				);
			},
			150
		);
	});

	$.append($$anchor, button);
}

$.delegate(['click']);