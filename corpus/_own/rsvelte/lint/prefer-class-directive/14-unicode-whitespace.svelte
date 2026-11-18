<script>
	let c = true;
</script>

<div class="a {c ? 'x' : ''} b">nbsp</div>
<div class="a﻿{c ? 'x' : ''}﻿b">bom</div>
<div class="a{c ? 'x' : ''}b">nel</div>
<div class="a　{c ? 'x' : ''}　b">ideo</div>
<div class="a{c ? 'x' : ''}b">vtab</div>
<div class="{c ? ' ' : 'x'}">nbsp-name</div>
<div class="{c ? '﻿' : 'x'}">bom-name</div>
<div class="{c ? '' : 'x'}">vtab-name</div>
