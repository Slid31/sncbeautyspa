import { getCatalog } from "./actions";
import { BookingWizard } from "./_components/booking-wizard";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: { service?: string };
};

export default async function BookingPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const catalog = await getCatalog();

  return (
    <BookingWizard
      catalog={catalog}
      locale={locale}
      preSelectServiceId={searchParams.service}
    />
  );
}
