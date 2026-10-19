import { Suspense } from "react";
import { TradesPage } from "@/features/trades/TradesPage";

export default function Page() {
  return (
    <Suspense>
      <TradesPage />
    </Suspense>
  );
}
