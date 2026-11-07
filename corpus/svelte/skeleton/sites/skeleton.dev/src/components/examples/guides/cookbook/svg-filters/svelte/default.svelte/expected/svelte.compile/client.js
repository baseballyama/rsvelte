import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="w-full grid grid-cols-3 gap-4"><div class="flex flex-col items-center space-y-2"><img class="rounded-container" alt="Apollo filter" loading="lazy" style="filter: url(#Apollo)"/> <span class="badge preset-tonal">#Apollo</span> <svg id="svg-filter-apollo" class="absolute -left-full w-0 h-0"><filter id="Apollo" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feColorMatrix values="0.8 0.6 -0.4 0.1 0, 0 1.2 0.05 0 0, 0 -1 3 0.02 0, 0 0 0 50 0" result="final" in="SourceGraphic"></feColorMatrix></filter></svg></div> <div class="flex flex-col items-center space-y-2"><img class="rounded-container" alt="BlueNight filter" loading="lazy" style="filter: url(#BlueNight)"/> <span class="badge preset-tonal">#BlueNight</span> <svg id="svg-filter-bluenight" class="filter absolute -left-full w-0 h-0"><filter id="BlueNight" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1.000 0.000 0.000 0.000 0.000
                    0.000 1.000 0.000 0.000 0.05
                    0.000 0.000 1.000 0.000 0.400
                    0.000 0.000 0.000 1.000 0.000"></feColorMatrix></filter></svg></div> <div class="flex flex-col items-center space-y-2"><img class="rounded-container" alt="Emerald filter" loading="lazy" style="filter: url(#Emerald)"/> <span class="badge preset-tonal">#Emerald</span> <svg id="svg-filter-emerald" class="filter absolute -left-full w-0 h-0"><filter id="Emerald" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" in="SourceGraphic" result="colormatrix" values=".16 .185 .129 0 0 .16 .185 .129 0 0 .16 .185 .129 0 0 0 0 0 0.33 0"></feColorMatrix><feComponentTransfer in="colormatrix" result="componentTransfer"><feFuncR type="table" tableValues="0.03 0.9"></feFuncR><feFuncG type="table" tableValues="0.57 1"></feFuncG><feFuncB type="table" tableValues="0.49 0.53"></feFuncB><feFuncA type="table" tableValues="0 1"></feFuncA></feComponentTransfer><feBlend mode="normal" in="componentTransfer" in2="SourceGraphic" result="blend"></feBlend></filter></svg></div> <div class="flex flex-col items-center space-y-2"><img class="rounded-container" alt="GreenFall filter" loading="lazy" style="filter: url(#GreenFall)"/> <span class="badge preset-tonal">#GreenFall</span> <svg id="svg-filter-greenfall" class="filter absolute -left-full w-0 h-0"><filter id="GreenFall" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="linearRGB"><feColorMatrix type="matrix" values="0.5 -0.4 0.3332 0 0 0 0.4 0.3 0 0 0 0 0.5 0 0 0 0 0 500 -20" x="0%" y="0%" width="100%" height="100%" in="SourceGraphic" result="colormatrix"></feColorMatrix></filter></svg></div> <div class="flex flex-col items-center space-y-2"><img class="rounded-container" alt="Noir filter" loading="lazy" style="filter: url(#Noir)"/> <span class="badge preset-tonal">#Noir</span> <svg id="svg-filter-noir" class="filter absolute -left-full w-0 h-0"><filter id="Noir" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="linearRGB"><feColorMatrix type="saturate" values="0" x="0%" y="0%" width="100%" height="100%" in="SourceGraphic" result="colormatrix1"></feColorMatrix><feBlend mode="lighten" x="0%" y="0%" width="100%" height="100%" in="colormatrix1" in2="colormatrix1" result="blend"></feBlend><feBlend mode="multiply" x="0%" y="0%" width="100%" height="100%" in="colormatrix1" in2="diffuseLighting" result="blend1"></feBlend></filter></svg></div> <div class="flex flex-col items-center space-y-2"><img class="rounded-container" alt="NoirLight filter" loading="lazy" style="filter: url(#NoirLight)"/> <span class="badge preset-tonal">#NoirLight</span> <svg id="svg-filter-noirlight" class="filter absolute -left-full w-0 h-0"><filter id="NoirLight" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="linearRGB"><feColorMatrix type="saturate" values="0" x="0%" y="0%" width="100%" height="100%" in="SourceGraphic" result="colormatrix2"></feColorMatrix><feBlend mode="saturation" x="0%" y="0%" width="100%" height="100%" in="SourceGraphic" in2="colormatrix2" result="blend2"></feBlend><feBlend mode="screen" x="0%" y="0%" width="100%" height="100%" in="colormatrix2" in2="blend2" result="blend3"></feBlend><feColorMatrix type="luminanceToAlpha" x="0%" y="0%" width="100%" height="100%" in="blend3" result="colormatrix3"></feColorMatrix><feBlend mode="exclusion" x="0%" y="0%" width="100%" height="100%" in="blend3" in2="colormatrix3" result="blend5"></feBlend></filter></svg></div> <div class="flex flex-col items-center space-y-2"><img class="rounded-container" alt="Rustic filter" loading="lazy" style="filter: url(#Rustic)"/> <span class="badge preset-tonal">#Rustic</span> <svg id="svg-filter-rustic" class="filter absolute -left-full w-0 h-0"><filter id="Rustic" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" in="SourceGraphic" result="colormatrix" values="0.39215686274509803 0.39215686274509803 0.39215686274509803  0 0
					0.3333333333333333 0.3333333333333333 0.3333333333333333  0 0
					0.30980392156862746 0.30980392156862746 0.30980392156862746  0 0
					0 0 0 1 0"></feColorMatrix></filter></svg></div> <div class="flex flex-col items-center space-y-2"><img class="rounded-container" alt="Summer84 filter" loading="lazy" style="filter: url(#Summer84)"/> <span class="badge preset-tonal">#Summer84</span> <svg id="svg-filter-summer84" class="filter absolute -left-full w-0 h-0"><filter id="Summer84" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1.300 0.200 0.000 0.000 0.000
					0.300 0.600 0.200 0.000 0.000
					0.200 1.000 0.200 0.000 0.000
					0.000 0.000 0.000 1.000 0.000"></feColorMatrix></filter></svg></div> <div class="flex flex-col items-center space-y-2"><img class="rounded-container" alt="XPro filter" loading="lazy" style="filter: url(#XPro)"/> <span class="badge preset-tonal">#XPro</span> <svg id="svg-filter-xpro" class="filter absolute -left-full w-0 h-0"><filter id="XPro" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1.70 -0.20 0.00 0.00 0.00
                    0.10 0.800 0.30 0.00 0.00
                    0.20 0.300 0.50 0.00 0.00
                    0.00 0.00 0.00 1.00 0.00"></feColorMatrix></filter></svg></div></div>`);

export default function Default($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var img = $.child(div_1);

	$.set_attribute(img, 'src', `https://picsum.photos/seed/skeleton/320`);
	$.next(4);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var img_1 = $.child(div_2);

	$.set_attribute(img_1, 'src', `https://picsum.photos/seed/skeleton/320`);
	$.next(4);
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var img_2 = $.child(div_3);

	$.set_attribute(img_2, 'src', `https://picsum.photos/seed/skeleton/320`);
	$.next(4);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var img_3 = $.child(div_4);

	$.set_attribute(img_3, 'src', `https://picsum.photos/seed/skeleton/320`);
	$.next(4);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var img_4 = $.child(div_5);

	$.set_attribute(img_4, 'src', `https://picsum.photos/seed/skeleton/320`);
	$.next(4);
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var img_5 = $.child(div_6);

	$.set_attribute(img_5, 'src', `https://picsum.photos/seed/skeleton/320`);
	$.next(4);
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var img_6 = $.child(div_7);

	$.set_attribute(img_6, 'src', `https://picsum.photos/seed/skeleton/320`);
	$.next(4);
	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var img_7 = $.child(div_8);

	$.set_attribute(img_7, 'src', `https://picsum.photos/seed/skeleton/320`);
	$.next(4);
	$.reset(div_8);

	var div_9 = $.sibling(div_8, 2);
	var img_8 = $.child(div_9);

	$.set_attribute(img_8, 'src', `https://picsum.photos/seed/skeleton/320`);
	$.next(4);
	$.reset(div_9);
	$.reset(div);
	$.append($$anchor, div);
}