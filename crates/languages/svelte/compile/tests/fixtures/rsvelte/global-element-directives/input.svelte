<script>import {fade} from "svelte/transition"; let c = $state("red"); let x=$state(1);</script>
<svelte:window style:color={c} class:a={x} transition:fade />
<svelte:body style:color|important={c} class:b />
