import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ locale: string; serviceId: string }>;
};

export default async function BookServicePage({ params }: Props) {
  const { serviceId } = await params;
  redirect(`/book?service=${serviceId}`);
}
