const { withAndroidManifest } = require("@expo/config-plugins");

// expo-camera and our bg-removal package both auto-inject a meta-data
// tag for the SAME MLKit key ("com.google.mlkit.vision.DEPENDENCIES")
// with different values (barcode_ui vs subject_segment). Since neither
// tag exists in our own app manifest until Gradle merges them in at
// build time, we can't "find and patch" it during prebuild — instead,
// we declare our OWN copy of this tag directly in the app manifest,
// with tools:replace already attached, so our declaration always wins
// the merge regardless of what the two libraries each try to set.
module.exports = function withMlkitManifestFix(config) {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;

    // tools:replace requires the "tools" XML namespace to be declared
    // on the root <manifest> tag, or the attribute is just ignored.
    if (!androidManifest.manifest.$["xmlns:tools"]) {
      androidManifest.manifest.$["xmlns:tools"] =
        "http://schemas.android.com/tools";
    }

    const application = androidManifest.manifest.application[0];
    if (!application["meta-data"]) {
      application["meta-data"] = [];
    }

    // Remove any prior copy we may have added on a previous prebuild,
    // then insert our authoritative version.
    application["meta-data"] = application["meta-data"].filter(
      (item) => item.$["android:name"] !== "com.google.mlkit.vision.DEPENDENCIES"
    );

    application["meta-data"].push({
      $: {
        "android:name": "com.google.mlkit.vision.DEPENDENCIES",
        "android:value": "subject_segment",
        "tools:replace": "android:value",
      },
    });

    return config;
  });
};