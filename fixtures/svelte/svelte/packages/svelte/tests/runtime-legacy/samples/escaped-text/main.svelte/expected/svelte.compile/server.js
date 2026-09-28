import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<!---->@x
@@x
#foo
##foo
%1
%%2 <div>@x
	@@x
	#foo
	##foo
	%1
	%%2</div> <div>@x
	@@x
	#foo
	##foo
	%1
	%%2 <span>inner</span></div>`);
}