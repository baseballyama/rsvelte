<script lang="ts">
export let object: Record<string, any>;
export let key: string;
export let objectKey: string | undefined = undefined;
function f2(){ return key; }
function f(v: any){ object[objectKey || key] = v; }
</script>{f}