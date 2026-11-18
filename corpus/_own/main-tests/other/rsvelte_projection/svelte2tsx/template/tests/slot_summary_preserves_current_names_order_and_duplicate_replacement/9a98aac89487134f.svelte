{#if visible}<slot name="named" first={value} />{/if}
<div><slot /></div>
<slot name="named" last={value} />
<slot name={dynamic} />
<slot name="pre{dynamic}post" />