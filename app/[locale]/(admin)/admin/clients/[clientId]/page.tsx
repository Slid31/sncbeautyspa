type Props = {
  params: Promise<{ clientId: string }>;
};

export default async function ClientProfilePage({ params }: Props) {
  const { clientId } = await params;
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Client: {clientId}</h1>
    </div>
  );
}
