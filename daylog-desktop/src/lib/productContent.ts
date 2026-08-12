import { useCallback, useEffect, useState } from "react";

export interface ProductLink {
  title: string;
  description: string;
  label: string;
  url: string;
}

export interface ReleaseContent {
  version: string;
  publishedAt?: string;
  notes?: string;
  downloadPageUrl?: string;
}

export interface ProductContent {
  schemaVersion: 1;
  remoteContentUrl: string;
  charge: {
    eyebrow: string;
    countLabel: string;
    title: string;
    intro: string;
    actionLabel: string;
  };
  productsSection: { title: string; subtitle: string };
  recommendation: { eyebrow: string; title: string; text: string; copyButtonLabel: string };
  links: {
    productGuideLabel: string;
    productGuideUrl: string;
    feedbackLabel: string;
    feedbackUrl: string;
    updateDownloadUrl: string;
  };
  products: ProductLink[];
  greetings: string[];
  release: ReleaseContent;
}

export type ContentSource = "local" | "remote" | "cache";

const fallbackContent: ProductContent = {
  schemaVersion: 1,
  remoteContentUrl: "",
  charge: {
    eyebrow: "此刻充能",
    countLabel: "100 件小事",
    title: "从一件具体的小事开始",
    intro: "不需要完成什么大事，照顾此刻也可以很简单。",
    actionLabel: "换一件小事"
  },
  productsSection: { title: "继续探索自己", subtitle: "当你想更深入地理解自己，可以从这里继续探索。" },
  recommendation: {
    eyebrow: "分享见己",
    title: "分享给朋友，一起记录、探索与成长",
    text: "最近在用【见己】安静地记录生活。留下自己的感受、想法和真实发生的事，在这个过程中更好地觉察和关照自己。推荐给你试试看。",
    copyButtonLabel: "复制推荐语"
  },
  links: {
    productGuideLabel: "产品说明",
    productGuideUrl: "https://my.feishu.cn/docx/DSVodGbRto9IaVxq999cpry2nff",
    feedbackLabel: "反馈与建议",
    feedbackUrl: "https://my.feishu.cn/docx/N2OTdIIYoo6aTZx98TAcJavmnte",
    updateDownloadUrl: "https://my.feishu.cn/docx/Vy6cd8dfXoBGe6xddFmc1aPxngG"
  },
  products: [],
  greetings: ["正念并不难，我们只需要记得去做。——莎朗·扎尔茨贝格"],
  release: { version: "0.1.0" }
};

const cacheKey = "daylog-remote-content-v3";
const legacyCacheKeys = [
  "daylog-remote-content",
  "daylog-remote-content-last-fetch",
  "daylog-remote-content-v2",
  "daylog-remote-content-last-fetch-v2"
];

function removeLegacyContentCache() {
  legacyCacheKeys.forEach((key) => window.localStorage.removeItem(key));
}

function mergeContent(base: ProductContent, next: Partial<ProductContent>): ProductContent {
  return {
    ...base,
    ...next,
    schemaVersion: 1,
    charge: { ...base.charge, ...next.charge },
    productsSection: { ...base.productsSection, ...next.productsSection },
    recommendation: { ...base.recommendation, ...next.recommendation },
    links: { ...base.links, ...next.links },
    products: Array.isArray(next.products) ? next.products : base.products,
    greetings: Array.isArray(next.greetings) && next.greetings.length ? next.greetings : base.greetings,
    release: { ...base.release, ...next.release }
  };
}

async function loadBundledContent() {
  try {
    const response = await fetch("data/daylog-content.json", { cache: "no-store" });
    if (!response.ok) throw new Error("bundled content not found");
    return mergeContent(fallbackContent, await response.json() as Partial<ProductContent>);
  } catch {
    return fallbackContent;
  }
}

function readCachedContent(base: ProductContent) {
  try {
    const cached = window.localStorage.getItem(cacheKey);
    return cached ? mergeContent(base, JSON.parse(cached) as Partial<ProductContent>) : null;
  } catch {
    window.localStorage.removeItem(cacheKey);
    return null;
  }
}

async function loadContent(): Promise<{ content: ProductContent; source: ContentSource; remoteFailed: boolean }> {
  removeLegacyContentCache();
  const bundled = await loadBundledContent();
  const remoteUrl = bundled.remoteContentUrl.trim();
  if (!remoteUrl) return { content: bundled, source: "local", remoteFailed: false };

  const cached = readCachedContent(bundled);
  try {
    const response = await fetch(remoteUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("remote content unavailable");
    const remote = await response.json() as Partial<ProductContent>;
    const content = mergeContent(bundled, { ...remote, remoteContentUrl: bundled.remoteContentUrl });
    window.localStorage.setItem(cacheKey, JSON.stringify(content));
    return { content, source: "remote", remoteFailed: false };
  } catch {
    return { content: cached ?? bundled, source: cached ? "cache" : "local", remoteFailed: true };
  }
}

export function useProductContent() {
  const [content, setContent] = useState(fallbackContent);
  const [source, setSource] = useState<ContentSource>("local");
  const [remoteFailed, setRemoteFailed] = useState(false);

  const refresh = useCallback(async () => {
    const loaded = await loadContent();
    setContent(loaded.content);
    setSource(loaded.source);
    setRemoteFailed(loaded.remoteFailed);
    return loaded;
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { content, source, remoteFailed };
}
