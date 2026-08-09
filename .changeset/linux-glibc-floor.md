---
'@rsvelte/svelte-check': patch
'@rsvelte/vite-plugin-svelte-native': patch
'@rsvelte/language-server': patch
'@rsvelte/compiler': patch
'@rsvelte/fmt': patch
'@rsvelte/lint': patch
---

Build the Linux binaries against glibc 2.35 instead of whatever `ubuntu-latest` happens to provide. The release matrix ran on the hosted `ubuntu-latest` image, which moved to Ubuntu 24.04 (glibc 2.39), so every published `linux-x64-gnu` / `linux-arm64-gnu` artifact refused to start on Ubuntu 22.04 LTS and other distributions on an older glibc — `libc.so.6: version 'GLIBC_2.39' not found`. The Linux legs are now pinned to `ubuntu-22.04`, and each one asserts the requirement by reading the artifact it just built, so a future image bump fails the release instead of shipping.
