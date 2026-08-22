<script>
	let v = $state(1);
	const obj = { a: 1 };
</script>

<my-element attr="1" prop={obj} onmy-event={() => v++}></my-element>
<x-y-z data-a={v}><slot-like>{v}</slot-like></x-y-z>
<div is="custom-div">is-attr</div>
<a href="#x" target="_blank" rel="noopener noreferrer">link</a>
<iframe title="f" src="about:blank" sandbox="allow-scripts"></iframe>
<object type="text/html" data="about:blank"><param name="p" value="1" /></object>
<dialog open>d</dialog>
<details open><summary>s</summary>body</details>
<search><p>s</p></search>
<button popovertarget="pt" onclick={() => v++}>{v}</button>
<div id="pt" popover>popover</div>
