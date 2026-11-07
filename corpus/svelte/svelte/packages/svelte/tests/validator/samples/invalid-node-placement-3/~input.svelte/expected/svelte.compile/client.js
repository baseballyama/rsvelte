import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var select_content = $.with_script($.from_html(
	`<option>The</option><hr/><script>
		console.log("hei");
	</script><template>Cool</template><option>bug</option>`,
	1
));

var root = $.from_html(`<select><!></select>`);

export default function Input($$anchor) {
	var select = root();

	$.customizable_select(select, () => {
		var anchor = $.child(select);
		var fragment = select_content();
		var option = $.first_child(fragment);

		option.value = option.__value = '0';

		var option_1 = $.sibling(option, 4);

		option_1.value = option_1.__value = '1';
		$.append(anchor, fragment);
	});

	$.append($$anchor, select);
}