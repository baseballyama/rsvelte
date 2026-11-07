<script lang="ts">
    let {
        children,
        handle, // query
        close,
        onclose,
    } = $props();

    let left = $state(0);
    let top = $state(0);

    let moving = false;

    function onMouseDown() {
        moving = true;
    }

    function onMouseMove(e: MouseEvent) {
        if (moving) {
            left += e.movementX;
            top += e.movementY;
        }
    }

    function onMouseUp() {
        moving = false;
    }

    function init(node: HTMLElement) {
        const handleElem = node.querySelector(handle) ?? node;
        handleElem.addEventListener("mousedown", onMouseDown, true);

        const closeElem = node.querySelector(close);
        closeElem?.addEventListener("click", onclose, true);

        return () => {
            handleElem.removeEventListener("mousedown", onMouseDown, true);
            closeElem?.removeEventListener("click", onclose, true);
        };
    }
</script>

<section {@attach init} style="left: {left}px; top: {top}px;" class={"draggable"} role="presentation">
    {@render children()}
</section>

<svelte:window onmouseup={onMouseUp} onmousemove={onMouseMove} />

<style>
    .draggable {
        user-select: none;
        cursor: auto;
        position: relative;
    }
</style>
