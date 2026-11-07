<script lang="ts">
  import { ImageButtonGroup, TextEditor } from "@flowbite-svelte-plugins/texteditor";
  import type { Editor } from "@tiptap/core";

  let editorInstance = $state<Editor | null>(null);

  const content = `<p>This is a basic example of implementing images. Drag to re-order.</p>
        <img src="/images/examples/image-1.jpg" />
        <img src="/images/examples/image-4@2x.jpg" />`;
</script>

<TextEditor bind:editor={editorInstance} {content} contentprops={{ id: "image-ex" }}>
  <ImageButtonGroup editor={editorInstance} />
</TextEditor>
