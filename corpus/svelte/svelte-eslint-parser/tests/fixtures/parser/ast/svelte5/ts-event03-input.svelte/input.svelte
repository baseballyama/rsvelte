<script lang="ts">
    const {onfoo}:{
        onfoo: (e: { detail: number }) => void
    } = $props()
    onfoo({detail: 1})
</script>

<button onclick="{e=>{
    e.currentTarget;
}}"></button>
<input oninput="{e=>{
    e.currentTarget;
}}">
