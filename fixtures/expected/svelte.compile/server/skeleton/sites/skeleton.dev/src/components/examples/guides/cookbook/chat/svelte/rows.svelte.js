import * as $ from 'svelte/internal/server';

export default function Rows($$renderer) {
	$$renderer.push(`<div class="w-full grid grid-cols-2 gap-10"><div class="h-full grid grid-rows-[auto_1fr_auto] gap-1"><div class="bg-surface-100-900 p-4">(search)</div> <div class="bg-surface-100-900 p-4">(list)</div> <div class="bg-surface-100-900 p-4">(footer)</div></div> <div class="h-full grid grid-rows-[1fr_auto] gap-1"><div class="bg-surface-100-900 p-4 overflow-y-auto max-h-[128px] space-y-4"><p>(feed)</p> <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit dolor ullam, qui et itaque quam distinctio dicta nostrum
				veritatis harum iure hic sequi aperiam, explicabo earum totam deserunt. Fugiat, temporibus.</p></div> <div class="bg-surface-100-900 p-4">(prompt)</div></div></div>`);
}