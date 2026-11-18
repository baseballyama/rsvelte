<script>import A from './A.svelte'; let x = $state(1);</script>
<A children="foo">
	<p>{x}</p>
</A>
<A children={2} position="apart">
	<b>hi</b>
</A>
<A children={x}>t</A>
