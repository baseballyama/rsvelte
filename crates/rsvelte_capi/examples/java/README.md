# Java FFM smoke test

Uses `java.lang.foreign` (Foreign Function & Memory API) finalized in
JDK 22. Will NOT compile on JDK 21 or earlier (the incubator package
name was different).

```bash
cargo build -p rsvelte_capi --release

# JDK 22+
java --enable-native-access=ALL-UNNAMED \
  crates/rsvelte_capi/examples/java/Smoke.java
```

JEP 330 single-file source-launch is used, so no `javac` step is needed.

For Kotlin / Scala, the same FFM API is callable directly — adapt the
type signatures to your build system.
