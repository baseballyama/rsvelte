import * as $ from 'svelte/internal/server';

export default function Invalid_test01_input($$renderer) {
	$$renderer.push(`<!---->space 
 space
 space 
   <div data-text="space   space  space    "></div>`);
}