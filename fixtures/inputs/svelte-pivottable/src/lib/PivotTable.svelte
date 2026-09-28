<script>
    import TableRenderers from "./TableRenderers";

    let { renderer: Renderer = TableRenderers.Table, ...restProps } = $props();
</script>

<Renderer {...restProps} />
