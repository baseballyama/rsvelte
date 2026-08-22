<script>
	let v = 'red';
	let n = 4;
</script>

<div style="--main-color: {v}; color: var(--main-color)">a</div>
<div style="--gap: {n}px {n}px; margin: var(--gap)">b</div>
<div
	style="color: red !important; margin: 0 !IMPORTANT; padding: 0 ! important; border-width: 0 !/*c*/important"
>c</div>
<div style="color: red !  important; outline-width: 0 !ImPoRtAnT">d</div>
<div style="content: '!important'; color: red">e</div>
<div style="--x: !important; color: blue">f</div>
