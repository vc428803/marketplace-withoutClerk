import { sseUrl } from "../../config/api";
import { useProductNotices } from "../../hooks/useProductNotices";
import { ProductNoticesPanel } from "./ProductNoticesPanel";

export default function ProductNoticesSection() {
  const { notices, connected, error } = useProductNotices(
    sseUrl("/products/stream"),
  );

  return (
    <section className="my-5 w-full">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <ProductNoticesPanel
          connected={connected}
          notices={notices}
          error={error}
        />
      </div>
    </section>
  );
}