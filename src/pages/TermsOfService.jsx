import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/Settings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: May 5, 2026</p>

        <div className="space-y-6 text-foreground">

          <section>
            <h2 className="text-xl font-semibold mb-2">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">By accessing and using Scripture Space ("Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Use License</h2>
            <p className="text-muted-foreground mb-2">We grant you a limited, non-exclusive, non-transferable license to use the Service for personal, non-commercial purposes. You agree <strong>not</strong> to:</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Violate any applicable laws or regulations</li>
              <li>Post illegal, defamatory, obscene, hateful, or harassing content</li>
              <li>Spam, phish, or attempt unauthorized access</li>
              <li>Scrape, crawl, or extract data from the Service</li>
              <li>Reverse engineer or attempt to derive source code</li>
              <li>Impersonate others or create fraudulent accounts</li>
              <li>Distribute malware, viruses, or harmful code</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. User Content & Intellectual Property</h2>
            <p className="text-muted-foreground mb-2">You retain all rights to content you create and post. By posting content, you grant Scripture Space a worldwide, royalty-free license to use, display, and distribute your content within the Service.</p>
            <p className="text-muted-foreground">Scripture Space retains all rights to the platform, technology, features, trademarks, logos, and branding.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Account Management</h2>
            <p className="text-muted-foreground mb-2">You are responsible for providing accurate information, maintaining confidentiality of your password, and all activity under your account.</p>
            <p className="text-muted-foreground">We may terminate or suspend your account for violation of these Terms, illegal activity, abuse of other users, or inactivity (180+ days without login).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Subscriptions & Payments</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li><strong>Billing:</strong> Leader Premium subscriptions are billed monthly at $7.00 USD, automatically on the same day each month</li>
              <li><strong>Cancellation:</strong> Cancel at any time via Settings. Effective at end of current billing cycle. No refunds for partial months.</li>
              <li><strong>Disputes:</strong> Must be reported within 30 days to support@scripturespace.app</li>
              <li><strong>Price Changes:</strong> We provide 30 days' notice before pricing changes. Changes apply only to renewals.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. User Conduct Standards</h2>
            <p className="text-muted-foreground mb-2"><strong>Prohibited Content:</strong></p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Hate speech or discrimination based on race, gender, religion, etc.</li>
              <li>Sexual, violent, or graphic content</li>
              <li>Personal identifying information of others without consent</li>
              <li>Spam, commercial solicitation, or MLM promotion</li>
              <li>Content encouraging illegal activity or self-harm</li>
            </ul>
            <p className="text-muted-foreground mt-3">Violations may result in warnings, temporary suspension, or permanent account termination. Severe violations (illegal content, threats) may result in immediate termination and law enforcement notification.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Community Features</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Group leaders are responsible for group moderation</li>
              <li>Prayer requests are visible to other users based on your privacy settings</li>
              <li>Anonymous requests are supported; non-anonymous requests display your name</li>
              <li>Do not use direct messages for harassment, spam, or illegal activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Disclaimers & Limitations</h2>
            <p className="text-muted-foreground mb-2">The Service is provided "AS IS" without warranties of any kind. We do not warrant uninterrupted availability, accuracy of content, or fitness for a particular purpose.</p>
            <p className="text-muted-foreground mb-2">To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages. Our total liability is limited to the amount you paid us in the 12 months preceding the claim.</p>
            <p className="text-muted-foreground"><strong>Scripture Space is a community platform, not professional counseling or medical advice.</strong> For mental health, medical, or pastoral concerns, consult qualified professionals.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">9. Governing Law & Disputes</h2>
            <p className="text-muted-foreground">Any dispute arising from these Terms shall be resolved through binding arbitration. You may opt out of arbitration by emailing support@scripturespace.app within 30 days of first use.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">10. Changes to Terms</h2>
            <p className="text-muted-foreground">We may update these Terms at any time. Changes are effective immediately upon posting. Your continued use constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">11. Contact Us</h2>
            <p className="text-muted-foreground">For questions about these Terms, email: <strong>support@scripturespace.app</strong></p>
          </section>

        </div>
      </div>
    </div>
  );
}