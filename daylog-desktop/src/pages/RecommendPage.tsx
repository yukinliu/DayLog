import { useEffect, useState } from "react";
import { ArrowUpRight, Copy, RefreshCw, Sparkles } from "lucide-react";
import { useEnergyActivities } from "../lib/energyActivities";
import { openExternalUrl } from "../lib/persistence";
import type { ProductContent } from "../lib/productContent";

export function RecommendPage({ content }: { content: ProductContent }) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [activityIndex, setActivityIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const activities = useEnergyActivities();
  const activity = activities[activityIndex];

  useEffect(() => {
    if (activities.length) setActivityIndex(Math.floor(Math.random() * activities.length));
  }, [activities.length]);

  const drawActivity = () => {
    if (!activities.length || isDrawing) return;
    setIsDrawing(true);
    window.setTimeout(() => {
      setActivityIndex((current) => {
        if (activities.length === 1) return 0;
        return (current + 1 + Math.floor(Math.random() * (activities.length - 1))) % activities.length;
      });
      setIsDrawing(false);
    }, 260);
  };

  const copyRecommendation = async () => {
    try {
      await navigator.clipboard.writeText(content.recommendation.text);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  };

  return (
    <section className="discover-page">
      <article className="energy-card">
        <div className="discover-heading">
          <span><Sparkles size={15} />{content.charge.eyebrow}</span>
          <small>{content.charge.countLabel}</small>
        </div>
        <h2>{content.charge.title}</h2>
        <p>{content.charge.intro}</p>
        <div className={`energy-result ${isDrawing ? "drawing" : ""}`} aria-live="polite">
          {activity ? (
            <>
              <div><span>{activity.category} · {activity.duration}</span></div>
              <div className="energy-result-title">
                <strong>{activity.title}</strong>
                <button type="button" onClick={drawActivity} disabled={isDrawing}>
                  <RefreshCw size={14} />
                  {isDrawing ? "寻找中…" : content.charge.actionLabel}
                </button>
              </div>
              <p>{activity.detail}</p>
            </>
          ) : <span className="muted-text">正在准备一件小事…</span>}
        </div>
      </article>

      {content.products.length > 0 && (
        <section className="explore-products">
          <div className="discover-section-title"><span>{content.productsSection.title}</span></div>
          <p className="discover-section-guide">{content.productsSection.subtitle}</p>
          <div className="product-link-list">
            {content.products.map((product) => (
              <button key={`${product.title}-${product.url}`} type="button" onClick={() => openExternalUrl(product.url)}>
                <span><strong>{product.title}</strong><small>{product.description}</small></span>
                <em>{product.label}<ArrowUpRight size={14} /></em>
              </button>
            ))}
          </div>
        </section>
      )}

      <article className="recommend-card discover-recommend-card">
        <div className="discover-section-title share-heading">
          <span>{content.recommendation.eyebrow}</span>
          <small>{content.recommendation.title}</small>
        </div>
        <div className="recommendation-copy-block">
          <blockquote>{content.recommendation.text}</blockquote>
          <button className="quiet-copy-button" type="button" onClick={copyRecommendation}>
            <Copy size={15} />
            {copyStatus === "copied" ? "已复制，可以发给朋友了" : copyStatus === "failed" ? "复制失败，请重试" : content.recommendation.copyButtonLabel}
          </button>
        </div>
      </article>
    </section>
  );
}
