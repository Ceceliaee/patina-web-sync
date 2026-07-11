import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const errors: string[] = [];

type Dimensions = {
  width: number;
  height: number;
};

function report(message: string) {
  errors.push(message);
}

async function pngDimensions(filePath: string): Promise<Dimensions | null> {
  let bytes: Buffer;
  try {
    bytes = await readFile(filePath);
  } catch {
    report(`Missing store asset: ${relative(REPO_ROOT, filePath)}`);
    return null;
  }

  const pngSignature = "89504e470d0a1a0a";
  if (bytes.length < 24 || bytes.subarray(0, 8).toString("hex") !== pngSignature) {
    report(`Store asset is not a valid PNG: ${relative(REPO_ROOT, filePath)}`);
    return null;
  }
  if (bytes.subarray(12, 16).toString("ascii") !== "IHDR") {
    report(`Store asset has no PNG IHDR header: ${relative(REPO_ROOT, filePath)}`);
    return null;
  }

  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

async function expectDimensions(relativePath: string, width: number, height: number) {
  const dimensions = await pngDimensions(join(REPO_ROOT, relativePath));
  if (!dimensions) return;
  if (dimensions.width !== width || dimensions.height !== height) {
    report(
      `${relativePath} must be ${width}x${height}; found ${dimensions.width}x${dimensions.height}.`,
    );
  }
}

async function directoryExists(directory: string) {
  try {
    return (await stat(directory)).isDirectory();
  } catch {
    return false;
  }
}

async function listPngs(relativeDirectory: string) {
  const directory = join(REPO_ROOT, relativeDirectory);
  if (!await directoryExists(directory)) return [];
  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && extname(entry.name).toLowerCase() === ".png")
    .map((entry) => `${relativeDirectory}/${entry.name}`)
    .sort((left, right) => left.localeCompare(right));
}

async function expectScreenshotSet(
  label: string,
  relativeDirectory: string,
  maximum: number,
  acceptedSizes: readonly Dimensions[],
  minimum = 1,
) {
  const files = await listPngs(relativeDirectory);
  if (files.length < minimum) {
    report(`${label} needs at least ${minimum} PNG screenshot(s); found ${files.length}.`);
  }
  if (files.length > maximum) {
    report(`${label} allows at most ${maximum} PNG screenshots; found ${files.length}.`);
  }
  for (const file of files) {
    const dimensions = await pngDimensions(join(REPO_ROOT, file));
    if (!dimensions) continue;
    const accepted = acceptedSizes.some(
      (size) => size.width === dimensions.width && size.height === dimensions.height,
    );
    if (!accepted) {
      const sizes = acceptedSizes.map((size) => `${size.width}x${size.height}`).join(" or ");
      report(`${file} must be ${sizes}; found ${dimensions.width}x${dimensions.height}.`);
    }
  }
}

async function checkDocumentation() {
  const listing = await readFile(join(REPO_ROOT, "STORE_LISTING.md"), "utf8");
  const privacy = await readFile(join(REPO_ROOT, "PRIVACY.md"), "utf8");
  const englishMessages = JSON.parse(
    await readFile(join(REPO_ROOT, "src", "chromium", "_locales", "en", "messages.json"), "utf8"),
  ) as Record<string, { message?: string }>;
  const chineseMessages = JSON.parse(
    await readFile(join(REPO_ROOT, "src", "chromium", "_locales", "zh_CN", "messages.json"), "utf8"),
  ) as Record<string, { message?: string }>;

  const requiredListingPaths = [
    "store-assets/chrome-web-store/extension-icon-128.png",
    "store-assets/chrome-web-store/screenshots/",
    "store-assets/chrome-web-store/small-promo-tile.png",
    "store-assets/firefox-amo/icon-64.png",
    "store-assets/firefox-amo/screenshots/",
    "store-assets/edge-add-ons/extension-logo-300.png",
    "store-assets/edge-add-ons/small-promo-tile.png",
  ];
  for (const requiredPath of requiredListingPaths) {
    if (!listing.includes(requiredPath)) {
      report(`STORE_LISTING.md must reference ${requiredPath}.`);
    }
  }

  const staleListingText = [
    "registration was blocked",
    "store-assets/edge-logo-300.png",
    "store-assets/screenshot-options-",
    "store-assets/small-promo-tile.png",
  ];
  for (const staleText of staleListingText) {
    if (listing.includes(staleText)) {
      report(`STORE_LISTING.md still contains stale text or path: ${staleText}`);
    }
  }

  const supportUrl = "https://github.com/Ceceliaee/patina-web-sync/issues";
  if (!listing.includes(supportUrl)) {
    report("STORE_LISTING.md must use the extension repository Issues URL for support.");
  }
  if (!privacy.includes(supportUrl)) {
    report("PRIVACY.md must use the extension repository Issues URL for privacy contact.");
  }

  const localizedDescriptions = [
    ["English", englishMessages.extensionDescription?.message ?? ""],
    ["Simplified Chinese", chineseMessages.extensionDescription?.message ?? ""],
  ] as const;
  for (const [label, description] of localizedDescriptions) {
    if (!description || description.length > 132) {
      report(`${label} manifest description must contain 1-132 characters; found ${description.length}.`);
    }
    if (!listing.includes(description)) {
      report(`STORE_LISTING.md must contain the exact ${label} manifest description.`);
    }
    if (description.length > 250) {
      report(`${label} Firefox summary must not exceed 250 characters.`);
    }
  }

  for (const heading of ["### Detailed Description", "### 详细描述"]) {
    const headingIndex = listing.indexOf(heading);
    const blockStart = listing.indexOf("```text\n", headingIndex) + "```text\n".length;
    const blockEnd = listing.indexOf("\n```", blockStart);
    if (headingIndex < 0 || blockStart < "```text\n".length || blockEnd < 0) {
      report(`STORE_LISTING.md must provide a copy-ready text block after ${heading}.`);
      continue;
    }
    const description = listing.slice(blockStart, blockEnd).trim();
    if (description.length < 250 || description.length > 10_000) {
      report(`${heading} must contain 250-10000 characters for Edge; found ${description.length}.`);
    }

    const browserNames = ["Chrome", "Edge", "Firefox", "Safari"];
    for (const browserName of browserNames) {
      if (description.toLowerCase().includes(browserName.toLowerCase())) {
        report(
          `${heading} must not reference another browser in public store copy; found ${browserName}.`,
        );
      }
    }
  }
}

await expectDimensions("store-assets/chrome-web-store/extension-icon-128.png", 128, 128);
await expectDimensions("store-assets/chrome-web-store/small-promo-tile.png", 440, 280);
await expectScreenshotSet(
  "Chrome Web Store",
  "store-assets/chrome-web-store/screenshots",
  5,
  [{ width: 1280, height: 800 }],
);

await expectDimensions("store-assets/firefox-amo/icon-32.png", 32, 32);
await expectDimensions("store-assets/firefox-amo/icon-64.png", 64, 64);
await expectScreenshotSet(
  "Firefox AMO",
  "store-assets/firefox-amo/screenshots",
  10,
  [{ width: 1280, height: 800 }],
);

await expectDimensions("store-assets/edge-add-ons/extension-logo-300.png", 300, 300);
await expectDimensions("store-assets/edge-add-ons/small-promo-tile.png", 440, 280);
await expectScreenshotSet(
  "Microsoft Edge Add-ons",
  "store-assets/edge-add-ons/screenshots",
  6,
  [
    { width: 1280, height: 800 },
    { width: 640, height: 480 },
  ],
  0,
);

await checkDocumentation();

if (errors.length > 0) {
  console.error("Store asset check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Store asset check passed.");
