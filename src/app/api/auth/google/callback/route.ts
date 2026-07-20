import { NextRequest, NextResponse } from "next/server";
import { loginSocialMock } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (error || !code) {
    console.error("Google OAuth error or missing code:", error);
    return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent(error || "missing_code")}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${siteUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    console.error("Google OAuth client configuration missing on callback");
    return NextResponse.redirect(`${siteUrl}/login?error=config_missing`);
  }

  try {
    // 1. Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Failed to exchange token:", errorText);
      return NextResponse.redirect(`${siteUrl}/login?error=token_exchange_failed`);
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    if (!accessToken) {
      console.error("No access token received from Google");
      return NextResponse.redirect(`${siteUrl}/login?error=no_access_token`);
    }

    // 2. Fetch user profile from Google using the access token
    const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userinfoResponse.ok) {
      console.error("Failed to fetch user info from Google");
      return NextResponse.redirect(`${siteUrl}/login?error=userinfo_fetch_failed`);
    }

    const profile = await userinfoResponse.json();
    const email = profile.email;

    if (!email) {
      console.error("No email in Google profile");
      return NextResponse.redirect(`${siteUrl}/login?error=no_email_in_profile`);
    }

    // 3. Log in or sign up the user using their Google email
    await loginSocialMock(email, "google");

    // 4. Redirect to auth callback page to show loading/success
    return NextResponse.redirect(`${siteUrl}/auth/callback?provider=google&email=${encodeURIComponent(email)}`);
  } catch (err: any) {
    console.error("Exception during Google OAuth callback processing:", err);
    return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent(err.message || "auth_callback_exception")}`);
  }
}
