import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ locale: string; serviceId: string }>;
};

export default async function BookServicePage({ params }: Props) {
  const { locale, serviceId } = await params;
  const base = locale === "fr" ? "/fr" : "";
  redirect(`${base}/book?service=${serviceId}`);
}
