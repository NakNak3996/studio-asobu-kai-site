// functions/_middleware.js
function unauthorized() {
  return new Response("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Studio Members", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}

export async function onRequest(context) {
  const auth = context.request.headers.get("Authorization");
  if (!auth) return unauthorized();

  const [scheme, encoded] = auth.split(" ");
  if (scheme !== "Basic" || !encoded) return unauthorized();

  let decoded = "";
  try {
    decoded = atob(encoded); // "user:pass"
  } catch {
    return unauthorized();
  }

  const i = decoded.indexOf(":");
  if (i < 0) return unauthorized();

  const user = decoded.slice(0, i);
  const pass = decoded.slice(i + 1);

  const expectedUser = context.env.BASIC_USER ?? "member";
  const expectedPass = context.env.BASIC_PASS; // Secretで設定する

  if (!expectedPass) {
    return new Response("Server misconfigured: BASIC_PASS is missing", { status: 500 });
  }

  if (user !== expectedUser || pass !== expectedPass) return unauthorized();

  return context.next();
}
