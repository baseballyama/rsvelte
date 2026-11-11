<script>
    let dynamic = "dynamic";
    void $$slots;
</script>
{#if dynamic}<slot name="named" first={dynamic} />{/if}
<div><slot /></div>
<slot name="named" last={dynamic} />
<slot name={dynamic} />
<slot name="pre{dynamic}post" />