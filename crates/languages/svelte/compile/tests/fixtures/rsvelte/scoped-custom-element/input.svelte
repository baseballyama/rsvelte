<script>let c = $state('a'); let { p } = $props();</script>
<my-el></my-el>
<my-el id="x"></my-el>
<my-el class="k"></my-el>
<my-el class={c}></my-el>
<my-el class:on={c}></my-el>
<my-el {...p}></my-el>
<div><my-el a={c}></my-el></div>
<style>my-el { color: red }</style>
