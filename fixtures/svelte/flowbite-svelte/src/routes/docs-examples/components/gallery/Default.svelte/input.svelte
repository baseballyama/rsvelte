<script lang="ts">
  import { Gallery } from "flowbite-svelte";
  const images = [
    { alt: "erbology", src: "/images/docs/gallery/square/image.jpg" },
    { alt: "shoes", src: "/images/docs/gallery/square/image-1.jpg" },
    { alt: "small bag", src: "/images/docs/gallery/square/image-2.jpg" },
    { alt: "plants", src: "/images/docs/gallery/square/image-3.jpg" },
    { alt: "watch", src: "/images/docs/gallery/square/image-4.jpg" },
    { alt: "shoe", src: "/images/docs/gallery/square/image-5.jpg" },
    { alt: "cream", src: "/images/docs/gallery/square/image-6.jpg" },
    { alt: "small bag", src: "/images/docs/gallery/square/image-7.jpg" },
    { alt: "lamp", src: "/images/docs/gallery/square/image-8.jpg" },
    { alt: "toiletbag", src: "/images/docs/gallery/square/image-9.jpg" },
    { alt: "playstation", src: "/images/docs/gallery/square/image-10.jpg" },
    { alt: "bag", src: "/images/docs/gallery/square/image-11.jpg" }
  ];
</script>

<Gallery items={images} class="grid-cols-2 gap-4 md:grid-cols-3" />
