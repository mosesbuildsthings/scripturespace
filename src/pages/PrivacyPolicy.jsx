import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/Settings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: May 5, 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">

          <section>
            <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">Scripture Space ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and mobile application (the "Service"). Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
            <h3 className="text-base font-semibold mt-4 mb-1">2.1 Information You Provide Directly</h3>
            <p className="text-muted-foreground font-medium mb-1">Authentication & Account Data</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Full name, email address (required for account creation and authentication)</li>
              <li>Profile information: biography, country, timezone, theme preferences, language selection</li>
              <li>Profile photos (up to 6 images)</li>
            </ul>
            <p className="text-muted-foreground font-medium mt-3 mb-1">User-Generated Content</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Posts, comments, and social interactions</li>
              <li>Prayer requests and prayer engagement</li>
              <li>Journal entries and spiritual reflections</li>
              <li>Bible verse highlights, notes, and saved verses</li>
              <li>Goals and habit tracking data</li>
              <li>Study plans and reading progress</li>
            </ul>
            <p className="text-muted-foreground font-medium mt-3 mb-1">Payment Information</p>
            <p className="text-muted-foreground">We do not directly collect payment card information. Payment processing is handled by Base44 Payments, our third-party payment processor. We store: checkout session ID, subscription status, subscription ID, and billing email address.</p>

            <h3 className="text-base font-semibold mt-4 mb-1">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Pages visited, features used, session duration</li>
              <li>Device information: OS, browser type, IP address, device model</li>
              <li>Session cookies for authentication and preference cookies for theme/language settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li><strong>Service Delivery:</strong> Account management, authentication, content delivery, community features</li>
              <li><strong>Personalization:</strong> Theme preferences, language selection, navigation layout</li>
              <li><strong>Analytics & Improvement:</strong> Understanding usage patterns, identifying bugs, enhancing features</li>
              <li><strong>Communication:</strong> Notifications (prayer reminders, daily encouragements — if enabled)</li>
              <li><strong>Payment Processing:</strong> Billing, subscription management, order fulfillment</li>
              <li><strong>Legal Compliance:</strong> Compliance with applicable laws, fraud prevention, account security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Data Storage & Retention</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Active account data: retained for the duration of your account</li>
              <li>Journal entries, study plans, goals: retained until explicitly deleted by you</li>
              <li>Deleted account data: permanently removed within 30 days of account deletion</li>
              <li>Payment records: retained for 7 years (tax/legal compliance)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Third-Party Sharing</h2>
            <p className="text-muted-foreground mb-2">We share information with trusted partners only for service delivery. <strong>We do not sell your personal data.</strong></p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Third Party</th>
                    <th className="text-left p-3 font-medium">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="p-3 text-muted-foreground">Base44 Payments</td>
                    <td className="p-3 text-muted-foreground">Payment processing & subscription management</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-3 text-muted-foreground">Base44 Platform</td>
                    <td className="p-3 text-muted-foreground">App hosting, authentication, analytics</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Your Rights</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li><strong>Access:</strong> Request a copy of your personal data by emailing support@scripturespace.app</li>
              <li><strong>Delete:</strong> Delete your account via Settings. Data removed within 30 days.</li>
              <li><strong>Export:</strong> Request your data in portable format by emailing support@scripturespace.app</li>
              <li><strong>Correct:</strong> Update your profile information directly in the app via Settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Security</h2>
            <p className="text-muted-foreground">We implement HTTPS encryption, secure authentication, and access controls. No security system is 100% secure — while we implement strong protections, we cannot guarantee absolute security against all threats.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Children's Privacy</h2>
            <p className="text-muted-foreground">Scripture Space is not intended for users under 13. We do not knowingly collect information from children under 13. If we become aware of such collection, we will delete the information and terminate the account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">9. Contact Us</h2>
            <p className="text-muted-foreground">For privacy-related questions or requests, email: <strong>support@scripturespace.app</strong></p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">10. Changes to This Policy</h2>
            <p className="text-muted-foreground">We may update this Privacy Policy periodically. Changes will be effective upon posting. Your continued use constitutes acceptance.</p>
          </section>

        </div>
      </div>
    </div>
  );
}