import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(
	`@x
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
	%%2 <span>inner</span></div>`,
	1
);

export default function Main($$anchor) {
	$.next();

	var fragment = root();

	$.next(3);
	$.append($$anchor, fragment);
}