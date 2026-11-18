<script>
	let v = $state('x');
	const spread = { title: 'from-spread', 'data-x': 1 };
</script>

<div title='single "double" inside' data-a="double 'single' inside"></div>
<div title={`back\`tick ${v}`} data-b={"quote\"inside"}></div>
<div {...spread} title="after-spread">a</div>
<div title="before-spread" {...spread}>b</div>
<div data-empty="" data-bare aria-hidden="true" hidden={false}></div>
<div class="a b c" style="color: red;;  background: blue"></div>
<div data-tpl="pre{v}post" data-multi="{v}-{v}"></div>
<input value={v} placeholder='{v}' />
<p>{v}</p>
