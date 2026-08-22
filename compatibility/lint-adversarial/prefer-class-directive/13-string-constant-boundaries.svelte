<script>
	let c = true;
	let v = 'x';
</script>

<div class="a {c ? 1 : ''} b">n1</div>
<div class="a {c ? 1n : ''} b">n2</div>
<div class="a {c ? null : ''} b">n3</div>
<div class="a {c ? 'x' + 'y' : ''} b">n4</div>
<div class="a {c ? `x` : ''} b">n5</div>
<div class="a {c ? `x${v}` : ''} b">n6</div>
<div class="a {c ? `x${'y'}` : ''} b">n7</div>
<div class="a {c ? /x/ : ''} b">n8</div>
<div class="a {c ? '\x41' : ''} b">n9</div>
<div class="a {c ? 'x' + 1 : ''} b">n10</div>
