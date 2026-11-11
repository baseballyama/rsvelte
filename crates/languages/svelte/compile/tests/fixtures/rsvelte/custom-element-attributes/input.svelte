<script>
	let { v = 1, o } = $props();
	let s = $state(2);
</script>
<my-el a="1" b={v} c={s} class="x" style="color: red" onclick={() => s++}></my-el>
<lite-youtube videoid="abc" params="x={v}"></lite-youtube>
<x-foo {...o} d={s}><span>{s}</span></x-foo>
<x-bar bind:this={o}></x-bar>
<div is="my-div" title={v}></div>
<x-baz class:active={s} style:color="red" data-a={s}></x-baz>
<p title="t" is="my-p" data-x={Math.max(v, 1)} fooBar="Q"></p>
<x-qux {...o} fooBar="Q"></x-qux>
