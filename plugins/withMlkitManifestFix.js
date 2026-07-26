const { withAndroidManifest } = require("@expo/config-plugins");

// Two of our native dependencies (expo-camera and the bg-removal package)
// both declare Android's shared "com.google.mlkit.vision.DEPENDENCIES"
// manifest key with different values, which Android's manifest merger
// refuses to resolve automatically. This plugin tells the merger to just
// let our bg-removal package's value win, since that's the MLKit feature
// (subject segmentation) we're actually using for the sticker cutout.
module.exports = function withMlkitManifestFix(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application[0];
    const metaDataList = application["meta-data"] || [];

    const targetMetaData = metaDataList.find(
      (item) => item.$["android:name"] === "com.google.mlkit.vision.DEPENDENCIES"
    );

    if (targetMetaData) {
      targetMetaData.$["tools:replace"] = "android:value";
    }

    return config;
  });
};