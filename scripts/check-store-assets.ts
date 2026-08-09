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
  const storeSubmission = await readFile(join(REPO_ROOT, "docs", "store-submission.md"), "utf8");
  const releaseRecord = await readFile(join(REPO_ROOT, "docs", "store-releases", "0.2.0.md"), "utf8");
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
    "awaiting review",
    "currently in review",
    "Facts verified for candidate",
    "Submitted version:",
    "store-assets/edge-logo-300.png",
    "store-assets/screenshot-options-",
    "store-assets/small-promo-tile.png",
  ];
  for (const staleText of staleListingText) {
    if (listing.includes(staleText)) {
      report(`STORE_LISTING.md still contains stale text or path: ${staleText}`);
    }
  }
  for (const [label, content] of [["STORE_LISTING.md", listing], ["docs/store-submission.md", storeSubmission]] as const) {
    for (const pattern of [
      /\b(?:awaiting review|currently in review|pending approval)\b/i,
      /候选版本是\s*`\d+\.\d+\.\d+`/,
      /只有\s*`\d+\.\d+\.\d+`\s*未被/,
      /截至\s*\d{4}\s*年[^\n]+已审核通过并公开/,
    ]) {
      if (pattern.test(content)) report(`${label} contains version-specific mutable status that belongs in docs/store-releases/<version>.md: ${pattern}`);
    }
  }

  if (!listing.includes("docs/store-releases/0.2.0.md")) {
    report("STORE_LISTING.md must link version-specific evidence instead of embedding review status.");
  }
  if (!storeSubmission.includes("./store-releases/0.2.0.md")) {
    report("docs/store-submission.md must link the 0.2.0 version record.");
  }
  for (const requiredRecordText of [
    "0.2.0",
    "EBD361E597D893C336838DF8D5E995FD4428FE3758B2F65A45BAB20054F227C5",
    "D935B77D6AA2FA9599A0DEA7AC44336DA29EDBF7B23F25C6F4757F2A4AC53038",
    "F34FD0511C7BFFDE12CBDCA8F584A97F9D671B5A58A2E6F80E19265AE996DCB2",
    "patina_web_sync-0.2.0.xpi",
    "web-sync@patina.local",
    "gimdckblhckibmeklhemgccabmbnoemd",
    "6349117",
    "1c97f45f-593b-4d9b-a75e-67e8d46e1e25",
    "已审核通过并公开",
    "最后核验日期：2026-08-09",
  ]) {
    if (!releaseRecord.includes(requiredRecordText)) {
      report(`docs/store-releases/0.2.0.md is missing version evidence: ${requiredRecordText}`);
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

  const maintainerDocs = [
    {
      path: "src/chromium/README.md",
      required: [
        "chromewebstore.google.com/detail/patina-web-sync/gimdckblhckibmeklhemgccabmbnoemd",
        "microsoftedge.microsoft.com/addons/detail/gogmlpjhbfjghilmpcciedplifdiibai",
        "The zip root contains `manifest.json`.",
        "Tab/window id, timestamps, and event reason stay out of the payload.",
      ],
      forbidden: ["not published in either store yet", "The zip contains a versioned extension folder."],
    },
    {
      path: "src/chromium/README.zh-CN.md",
      required: [
        "chromewebstore.google.com/detail/patina-web-sync/gimdckblhckibmeklhemgccabmbnoemd",
        "microsoftedge.microsoft.com/addons/detail/gogmlpjhbfjghilmpcciedplifdiibai",
        "zip 根目录直接包含 `manifest.json`",
        "不发送标签页/窗口 ID、采集时间或事件原因",
      ],
      forbidden: ["当前扩展尚未发布到这两个商店", "zip 内包含一个带版本号的扩展目录"],
    },
    {
      path: "src/firefox/README.md",
      required: [
        "addons.mozilla.org/firefox/addon/patina-web-sync/", "public listed AMO `.xpi`",
        "The formal GitHub Release XPI is not signed locally.",
        "Tab/window id, timestamps, and event reason stay out of the payload.",
      ],
      forbidden: [
        "the extension is not listed on AMO yet",
        "user-facing GitHub Release package is a Mozilla AMO `unlisted` signed `.xpi`",
      ],
    },
    {
      path: "src/firefox/README.zh-CN.md",
      required: [
        "addons.mozilla.org/zh-CN/firefox/addon/patina-web-sync/", "AMO 同版本公开 listed XPI",
        "正式 GitHub Release XPI 不在本地重新签名", "不发送标签页/窗口 ID、采集时间或事件原因",
      ],
      forbidden: [
        "当前扩展尚未 listed on AMO",
        "GitHub Release 用户安装包是经 Mozilla AMO `unlisted` 签名的 `.xpi`",
      ],
    },
  ] as const;
  for (const doc of maintainerDocs) {
    const content = await readFile(join(REPO_ROOT, doc.path), "utf8");
    for (const required of doc.required) {
      if (!content.includes(required)) report(`${doc.path} must include current distribution text: ${required}`);
    }
    for (const forbidden of doc.forbidden) {
      if (content.includes(forbidden)) report(`${doc.path} still contains retired text: ${forbidden}`);
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
