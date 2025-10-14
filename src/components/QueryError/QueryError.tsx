interface QueryErrorProps {
  error: unknown;
}

export default function QueryError({ error }: QueryErrorProps) {
  const message =
    error instanceof Error ? error.message : "Failed to load notes";
  return <p style={{ color: "crimson" }}>{message}</p>;
}
